import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const username = searchParams.get("username") || ""
    const realName = searchParams.get("realName") || ""

    const where: any = {}
    if (username) where.username = { contains: username }
    if (realName) where.realName = { contains: realName }

    const [list, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          roles: { include: { role: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    const safeList = list.map(({ password, ...user }) => ({
      ...user,
      roles: user.roles.map((ur) => ur.role.name),
    }))

    return NextResponse.json({
      code: 200,
      data: { list: safeList, total, page, pageSize },
      message: "success",
    })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const hashedPassword = await bcrypt.hash(body.password || "123456", 10)
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        realName: body.realName,
        phone: body.phone,
        email: body.email,
        status: body.status ?? 0,
        tenantId: body.tenantId || "default",
      },
    })
    const { password, ...safeUser } = user
    return NextResponse.json({ code: 200, data: safeUser, message: "创建成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    const body = await req.json()
    const data: any = { realName: body.realName, phone: body.phone, email: body.email, status: body.status }
    if (body.password) data.password = await bcrypt.hash(body.password, 10)
    const user = await prisma.user.update({ where: { id }, data })
    const { password, ...safeUser } = user
    return NextResponse.json({ code: 200, data: safeUser, message: "更新成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}
