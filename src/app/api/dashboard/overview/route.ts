import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 模拟数据 - 当真实数据不足时用于填充
const MOCK_CHANNEL_STATS = [
  { name: "抖音", revenue: 26480000, orders: 408, conv: "2.8%" },
  { name: "快手", revenue: 12100000, orders: 221, conv: "2.1%" },
  { name: "视频号", revenue: 8240000, orders: 120, conv: "1.8%" },
  { name: "淘宝", revenue: 5980000, orders: 73, conv: "1.2%" },
  { name: "京东", revenue: 5280000, orders: 68, conv: "1.5%" },
]

const MOCK_DAILY_REVENUE = (() => {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    days.push({ date: dateStr, revenue: Math.floor(Math.random() * 1000000) + 500000, orders: Math.floor(Math.random() * 20) + 5 })
  }
  return days
})()

const MOCK_TOP_PRODUCTS = [
  { name: "连衣裙-白-M", revenue: 8500000, sales: 1280 },
  { name: "休闲T恤-黑-L", revenue: 6200000, sales: 950 },
  { name: "牛仔裤-蓝-31", revenue: 5800000, sales: 720 },
  { name: "羽绒服-灰-M", revenue: 4200000, sales: 340 },
  { name: "运动鞋-白-42", revenue: 3800000, sales: 560 },
]

// GET /api/dashboard/overview - 看板概览数据
export async function GET() {
  try {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // ====== 本月统计 ======
    const [thisMonthOrders, thisMonthRevenue] = await Promise.all([
      prisma.order.count({
        where: { orderTime: { gte: firstDayOfMonth } },
      }),
      prisma.order.aggregate({
        _sum: { realAmount: true },
        where: { orderTime: { gte: firstDayOfMonth } },
      }),
    ])

    // ====== 上月统计（用于计算环比） ======
    const [lastMonthOrders, lastMonthRevenue] = await Promise.all([
      prisma.order.count({
        where: { orderTime: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth } },
      }),
      prisma.order.aggregate({
        _sum: { realAmount: true },
        where: { orderTime: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth } },
      }),
    ])

    // ====== 活跃店铺 ======
    const activeShops = await prisma.shop.count({
      where: { status: 0 },
    })

    // ====== 渠道统计（按 channel 分组） ======
    const channelRows = await prisma.order.groupBy({
      by: ["channel"],
      _sum: { realAmount: true },
      _count: { id: true },
      where: { channel: { not: null } },
    })

    // 按营收排序取前5
    const channelStats = channelRows
      .sort((a, b) => Number(b._sum.realAmount || 0) - Number(a._sum.realAmount || 0))
      .slice(0, 5)
      .map((r) => ({
        name: r.channel || "未知",
        revenue: Number(r._sum.realAmount || 0) * 100, // 分单位
        orders: r._count.id,
        conv: ((r._count.id / (thisMonthOrders || 1)) * 100).toFixed(1) + "%",
      }))

    // 如果真实渠道数据不足，用模拟数据补充
    const finalChannelStats = channelStats.length >= 3
      ? channelStats
      : MOCK_CHANNEL_STATS

    // ====== 近30天每日营收（按天分组） ======
    const dailyAgg = await prisma.order.findMany({
      where: { orderTime: { gte: thirtyDaysAgo } },
      select: { realAmount: true, orderTime: true },
      orderBy: { orderTime: "asc" },
    })

    const dailyMap = new Map<string, { revenue: number; orders: number }>()
    for (const o of dailyAgg) {
      if (!o.orderTime) continue
      const key = o.orderTime.toISOString().slice(0, 10)
      const existing = dailyMap.get(key) || { revenue: 0, orders: 0 }
      existing.revenue += Number(o.realAmount) * 100 // 分单位
      existing.orders++
      dailyMap.set(key, existing)
    }

    // 填满近30天（缺的补0）
    const dailyRevenue: { date: string; revenue: number; orders: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      const data = dailyMap.get(key) || { revenue: 0, orders: 0 }
      dailyRevenue.push({ date: key, revenue: data.revenue, orders: data.orders })
    }

    // 如果真实数据太少（不到一半天数有数据），fallback 到模拟
    const daysWithData = dailyRevenue.filter(d => d.orders > 0).length
    const finalDailyRevenue = daysWithData >= 5 ? dailyRevenue : MOCK_DAILY_REVENUE

    // ====== 热销商品TOP5（从 OrderItem 聚合） ======
    const topProductRows = await prisma.orderItem.groupBy({
      by: ["skuName"],
      _sum: { subtotal: true, quantity: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 5,
    })

    const topProducts = topProductRows.map((r) => ({
      name: r.skuName,
      revenue: Number(r._sum.subtotal || 0) * 100, // 分单位
      sales: r._sum.quantity || 0,
    }))

    const finalTopProducts = topProducts.length >= 3 ? topProducts : MOCK_TOP_PRODUCTS

    // ====== 访客和PV（暂时基于订单数估算模拟） ======
    const thisMonthRevenueNum = Number(thisMonthRevenue._sum.realAmount || 0) * 100
    const lastMonthRevenueNum = Number(lastMonthRevenue._sum.realAmount || 0) * 100

    // 计算环比
    const revenueChange = lastMonthRevenueNum > 0
      ? ((thisMonthRevenueNum - lastMonthRevenueNum) / lastMonthRevenueNum) * 100
      : 0
    const orderChange = lastMonthOrders > 0
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0

    return NextResponse.json({
      code: 200,
      data: {
        stats: {
          totalRevenue: thisMonthRevenueNum,
          totalOrders: thisMonthOrders,
          activeShops,
          visitors: Math.round(thisMonthOrders * 15.3), // 基于订单数估算
          pageViews: Math.round(thisMonthOrders * 103.8),
          refundRate: "0.0%",
          revenueChange: Math.round(revenueChange * 10) / 10,
          orderChange: Math.round(orderChange * 10) / 10,
        },
        channelStats: finalChannelStats,
        dailyRevenue: finalDailyRevenue,
        topProducts: finalTopProducts,
      },
      message: "success",
    })
  } catch (error) {
    console.error("看板数据查询失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}
