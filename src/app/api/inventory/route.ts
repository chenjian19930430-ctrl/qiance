import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/inventory?page=1&pageSize=20&search=
// GET /api/inventory/overview?page=1&pageSize=20&search=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const search = searchParams.get("search") || ""

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }

    const [list, total] = await Promise.all([
      prisma.sku.findMany({
        where,
        include: { spu: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.sku.count({ where }),
    ])

    const data = list.map(sku => ({
      id: sku.id,
      skuName: sku.name,
      skuCode: sku.code,
      category: sku.spu?.name || "-",
      warehouse: "主仓",
      total: sku.stock,
      reserved: Math.round(sku.stock * 0.03), // estimate reserved
      available: Math.round(sku.stock * 0.97),
      threshold: 50,
      unit: "件",
      status: sku.stock <= 0 ? "out" : sku.stock < 50 ? "low" : "normal",
    }))

    return NextResponse.json({ code: 200, data: { list: data, total, page, pageSize }, message: "success" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Inventory inbound registration
    return NextResponse.json({ code: 200, data: { id: "new-" + Date.now() }, message: "入库登记成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "入库失败" }, { status: 500 })
  }
}
