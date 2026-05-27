import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const type = parseInt(searchParams.get("type") || "0")
    const orderNo = searchParams.get("orderNo") || ""

    const where: any = { type }
    if (orderNo) where.orderNo = { contains: orderNo }

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
