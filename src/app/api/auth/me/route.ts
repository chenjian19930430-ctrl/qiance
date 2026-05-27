import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ code: 401, data: null, message: "未登录" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ code: 404, data: null, message: "用户不存在" }, { status: 404 })
  }

  return NextResponse.json({
    code: 200,
    data: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      tenantId: user.tenantId,
      roles: user.roles.map((ur) => ur.role.code),
      permissions: user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code)),
    },
    message: "success",
  })
}
