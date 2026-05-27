import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/warehouse - 分页查询仓库
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
      prisma.warehouse.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.warehouse.count({ where }),
    ])

    return NextResponse.json({
      code: 200,
      data: { list, total, page, pageSize },
      message: "success",
    })
  } catch (error) {
    console.error("仓库查询失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

// POST /api/warehouse - 新建仓库
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const warehouse = await prisma.warehouse.create({
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        contact: body.contact,
        phone: body.phone,
        status: body.status ?? 0,
        tenantId: "default",
      },
    })
    return NextResponse.json({ code: 200, data: warehouse, message: "创建成功" })
  } catch (error) {
    console.error("仓库创建失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}

// PUT /api/warehouse - 更新仓库
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    const body = await req.json()
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        contact: body.contact,
        phone: body.phone,
        status: body.status,
      },
    })
    return NextResponse.json({ code: 200, data: warehouse, message: "更新成功" })
  } catch (error) {
    console.error("仓库更新失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

// DELETE /api/warehouse - 删除仓库
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    await prisma.warehouse.delete({ where: { id } })
    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    console.error("仓库删除失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}
