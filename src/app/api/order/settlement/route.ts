import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const search = searchParams.get("search") || ""
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // 查询已完成订单的结算汇总
    const where: any = { type: 0, orderStatus: { in: [1, 2] } } // 已发货或已完成
    if (startDate || endDate) {
      where.orderTime = {}
      if (startDate) where.orderTime.gte = new Date(startDate)
      if (endDate) where.orderTime.lte = new Date(endDate + "T23:59:59.999Z")
    }

    const [list, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNo: true,
          channel: true,
          orderTime: true,
          totalAmount: true,
          discountAmount: true,
          realAmount: true,
          platformFee: true,
          logisticsFee: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { orderTime: "desc" },
      }),
      prisma.order.count({ where }),
    ])

    // 计算汇总
    const agg = await prisma.order.aggregate({
      where,
      _sum: {
        totalAmount: true,
        realAmount: true,
        platformFee: true,
        logisticsFee: true,
      },
      _count: { id: true },
    })

    // 按渠道分组统计
    const channelStats = await prisma.order.groupBy({
      by: ["channel"],
      where,
      _sum: {
        realAmount: true,
        platformFee: true,
      },
      _count: { id: true },
    })

    const summary = {
      totalOrders: agg._count.id,
      totalAmount: agg._sum.totalAmount || 0,
      realAmount: agg._sum.realAmount || 0,
      platformFees: agg._sum.platformFee || 0,
      logisticsFees: agg._sum.logisticsFee || 0,
      netAmount: Number(agg._sum.realAmount || 0) - Number(agg._sum.platformFee || 0) - Number(agg._sum.logisticsFee || 0),
      channelStats,
    }

    // 模拟批次分组（按周）
    const settlementBatches = buildBatches(list)

    return NextResponse.json({
      code: 200,
      data: {
        list: settlementBatches,
        total: settlementBatches.length,
        page: 1,
        pageSize: 50,
        summary,
      },
      message: "success",
    })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

function buildBatches(orders: Array<{
  id: string
  orderNo: string
  channel: string | null
  orderTime: Date | null
  totalAmount: any
  discountAmount: any
  realAmount: any
  platformFee: any
  logisticsFee: any
}>) {
  // 按渠道+周分组
  const groups = new Map<string, {
    orders: typeof orders
    channel: string
    weekKey: string
    periodStart: string
    periodEnd: string
  }>()

  for (const order of orders) {
    const t = order.orderTime ? new Date(order.orderTime) : new Date()
    const weekStart = new Date(t)
    weekStart.setDate(t.getDate() - t.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const channel = order.channel || "未知"
    const key = `${channel}_${weekStart.toISOString().slice(0, 10)}`

    if (!groups.has(key)) {
      groups.set(key, {
        orders: [],
        channel,
        weekKey: key,
        periodStart: weekStart.toISOString().slice(0, 10),
        periodEnd: weekEnd.toISOString().slice(0, 10),
      })
    }
    groups.get(key)!.orders.push(order)
  }

  const batches = Array.from(groups.entries()).map(([key, g], idx) => {
    const totalAmt = g.orders.reduce((s, o) => s + Number(o.totalAmount), 0)
    const realAmt = g.orders.reduce((s, o) => s + Number(o.realAmount), 0)
    const feeAmt = g.orders.reduce((s, o) => s + Number(o.platformFee), 0)
    const logFee = g.orders.reduce((s, o) => s + Number(o.logisticsFee), 0)
    const netAmt = realAmt - feeAmt - logFee
    const batchNo = `SET-${g.periodStart.replace(/-/g, "")}-${String(idx + 1).padStart(2, "0")}`

    return {
      id: batchNo,
      batchNo,
      period: `${g.periodStart.slice(5)}-${g.periodEnd.slice(5)}`,
      platform: g.channel,
      orderCount: g.orders.length,
      totalAmount: realAmt,
      commission: feeAmt,
      netAmount: netAmt,
      status: "settled" as const,
    }
  })

  return batches.sort((a, b) => b.batchNo.localeCompare(a.batchNo))
}
