import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

// POST /api/auth/login - 登录（JWT模式）
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ code: 400, data: null, message: "请输入用户名和密码" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    })

    if (!user) {
      return NextResponse.json({ code: 401, data: null, message: "用户不存在" }, { status: 401 })
    }

    if (user.status === 1) {
      return NextResponse.json({ code: 403, data: null, message: "账号已被禁用" }, { status: 403 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ code: 401, data: null, message: "密码错误" }, { status: 401 })
    }

    const secret = process.env.AUTH_SECRET || "qiance-auth-secret-dev"
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, username: user.username },
      secret,
      { expiresIn: "24h" }
    )

    return NextResponse.json({
      code: 200,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          realName: user.realName,
          tenantId: user.tenantId,
          roles: user.roles.map(ur => ur.role.code),
        },
      },
      message: "登录成功",
    })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "登录失败" }, { status: 500 })
  }
}
