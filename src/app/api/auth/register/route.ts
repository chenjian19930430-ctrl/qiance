import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password, phone } = body

    // 检查用户是否已存在
    const existing = await prisma.user.findUnique({
      where: { username },
    })
    if (existing) {
      return NextResponse.json(
        { code: 400, data: null, message: "用户名已存在" },
        { status: 400 }
      )
    }

    // 获取默认租户（或创建新租户）
    let tenant = await prisma.tenant.findFirst({
      where: { code: "DEFAULT" },
    })
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: "默认租户",
          code: "DEFAULT",
        },
      })
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        phone,
        realName: username,
        tenantId: tenant.id,
      },
    })

    // 分配默认角色
    let defaultRole = await prisma.role.findFirst({
      where: { code: "staff", tenantId: tenant.id },
    })
    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          name: "普通员工",
          code: "staff",
          tenantId: tenant.id,
        },
      })
    }
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: defaultRole.id,
      },
    })

    return NextResponse.json({
      code: 200,
      data: { id: user.id, username: user.username },
      message: "注册成功",
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { code: 500, data: null, message: "注册失败" },
      { status: 500 }
    )
  }
}
