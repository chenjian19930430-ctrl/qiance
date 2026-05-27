import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/dashboard/overview - 首页概览数据
export async function GET() {
  try {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalOrders, totalRevenue, totalRefunds] = await Promise.all([
      prisma.order.count({
        where: { orderTime: { gte: firstDay } },
      }),
      prisma.order.aggregate({
        _sum: { realAmount: true },
        where: { orderTime: { gte: firstDay } },
      }),
      prisma.order.count({
        where: { type: 2, orderTime: { gte: firstDay } },
      }),
    ])

    const refundRate = totalOrders > 0 ? ((totalRefunds / totalOrders) * 100).toFixed(1) : "0"

    return NextResponse.json({
      code: 200,
      data: {
        totalRevenue: totalRevenue._sum.realAmount || 0,
        totalOrders,
        totalRefunds,
        refundRate: `${refundRate}%`,
      },
      message: "success",
    })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}
