import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    // 单订单详情查询（含 items）
    if (id) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      })
      if (!order) {
        return NextResponse.json({ code: 404, data: null, message: "订单不存在" }, { status: 404 })
      }
      return NextResponse.json({
        code: 200,
        data: order,
        message: "success",
      })
    }

    // 分页查询
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const type = parseInt(searchParams.get("type") || "0")
    const orderStatus = searchParams.get("orderStatus")
    const orderNo = searchParams.get("orderNo") || ""
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = { type }
    if (orderNo) where.orderNo = { contains: orderNo }
    if (orderStatus && orderStatus !== "") where.orderStatus = parseInt(orderStatus)
    if (startDate || endDate) {
      where.orderTime = {}
      if (startDate) where.orderTime.gte = new Date(startDate)
      if (endDate) where.orderTime.lte = new Date(endDate + "T23:59:59.999Z")
    }

    const [list, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { orderTime: "desc" },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      code: 200,
      data: { list, total, page, pageSize },
      message: "success",
    })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    const body = await req.json()
    const order = await prisma.order.update({ where: { id }, data: body })
    return NextResponse.json({ code: 200, data: order, message: "更新成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}
