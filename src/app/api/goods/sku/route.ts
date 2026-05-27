import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/goods/sku
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const name = searchParams.get("name") || ""
    const spuId = searchParams.get("spuId") || ""

    const where: any = {}
    if (name) where.name = { contains: name }
    if (spuId) where.spuId = spuId

    const [list, total] = await Promise.all([
      prisma.sku.findMany({
        where,
        include: { spu: true, shop: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.sku.count({ where }),
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

// POST /api/goods/sku
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sku = await prisma.sku.create({ data: body })
    return NextResponse.json({ code: 200, data: sku, message: "创建成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}
