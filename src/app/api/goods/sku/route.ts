import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/goods/sku - SKU列表（带分页+搜索）
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const name = searchParams.get("name") || ""
    const spuId = searchParams.get("spuId") || ""

    const where: Record<string, unknown> = {}
    if (name) where.name = { contains: name }
    if (spuId) where.spuId = spuId

    const [list, total] = await Promise.all([
      prisma.sku.findMany({
        where,
        include: { spu: { select: { id: true, name: true } }, shop: { select: { id: true, name: true } } },
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
    console.error("[SKU GET]", error)
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

// POST /api/goods/sku - 创建SKU
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sku = await prisma.sku.create({
      data: {
        name: body.name,
        code: body.code,
        spuId: body.spuId,
        shopId: body.shopId || null,
        salePrice: body.salePrice ?? 0,
        costPrice: body.costPrice ?? 0,
        stock: body.stock ?? 0,
        status: body.status ?? 0,
        spec: body.spec || undefined,
        tenantId: body.tenantId || "default",
      },
    })
    return NextResponse.json({ code: 200, data: sku, message: "创建成功" })
  } catch (error) {
    console.error("[SKU POST]", error)
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}

// PUT /api/goods/sku - 更新SKU
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    const body = await req.json()
    const sku = await prisma.sku.update({ where: { id }, data: body })
    return NextResponse.json({ code: 200, data: sku, message: "更新成功" })
  } catch (error) {
    console.error("[SKU PUT]", error)
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

// DELETE /api/goods/sku - 删除SKU
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    await prisma.sku.delete({ where: { id } })
    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    console.error("[SKU DELETE]", error)
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}
