import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/company - 公司列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const name = searchParams.get("name") || ""

    const where = name ? { name: { contains: name } } : {}

    const [list, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.company.count({ where }),
    ])

    return NextResponse.json({
      code: 200,
      data: { list, total, page, pageSize },
      message: "success",
    })
  } catch (error) {
    console.error("Company list error:", error)
    return NextResponse.json(
      { code: 500, data: null, message: "查询失败" },
      { status: 500 }
    )
  }
}

// PUT /api/company - 更新公司
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    const body = await req.json()
    const company = await prisma.company.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        phone: body.phone,
        contact: body.contact,
        status: body.status,
      },
    })
    return NextResponse.json({ code: 200, data: company, message: "更新成功" })
  } catch (error) {
    console.error("Company update error:", error)
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

// DELETE /api/company - 删除公司
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    await prisma.company.delete({ where: { id } })
    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    console.error("Company delete error:", error)
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}

// POST /api/company - 创建公司
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const company = await prisma.company.create({
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        phone: body.phone,
        contact: body.contact,
        tenantId: body.tenantId || "default",
      },
    })

    return NextResponse.json({
      code: 200,
      data: company,
      message: "创建成功",
    })
  } catch (error) {
    console.error("Company create error:", error)
    return NextResponse.json(
      { code: 500, data: null, message: "创建失败" },
      { status: 500 }
    )
  }
}
