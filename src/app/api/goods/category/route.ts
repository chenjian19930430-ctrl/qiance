import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/goods/category - 商品分类列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const name = searchParams.get("name") || ""

    const where = name ? { name: { contains: name } } : {}

    const [list, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sort: "asc" },
      }),
      prisma.category.count({ where }),
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

// PUT /api/goods/category
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    const body = await req.json()
    const cat = await prisma.category.update({ where: { id }, data: body })
    return NextResponse.json({ code: 200, data: cat, message: "更新成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

// DELETE /api/goods/category
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}

// POST /api/goods/category
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cat = await prisma.category.create({
      data: {
        name: body.name,
        parentId: body.parentId,
        sort: body.sort || 0,
        status: body.status ?? 0,
        tenantId: body.tenantId || "default",
      },
    })
    return NextResponse.json({ code: 200, data: cat, message: "创建成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}
