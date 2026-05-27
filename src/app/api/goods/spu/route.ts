import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/goods/spu
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const name = searchParams.get("name") || ""
    const categoryId = searchParams.get("categoryId") || ""

    const where: any = {}
    if (name) where.name = { contains: name }
    if (categoryId) where.categoryId = categoryId

    const [list, total] = await Promise.all([
      prisma.spu.findMany({
        where,
        include: { category: true, skus: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.spu.count({ where }),
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

// POST /api/goods/spu
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const spu = await prisma.spu.create({ data: body })
    return NextResponse.json({ code: 200, data: spu, message: "创建成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}
