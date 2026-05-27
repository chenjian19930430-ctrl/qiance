import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/conversations - 对话列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || "default"
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "50")

    const [list, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { messages: true } },
        },
      }),
      prisma.conversation.count({ where: { userId } }),
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

// POST /api/conversations - 创建新对话
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const conv = await prisma.conversation.create({
      data: {
        userId: body.userId || "default",
        tenantId: body.tenantId || "default",
        title: body.title || "新对话",
        agentId: body.agentId || null,
        status: 0,
      },
    })
    return NextResponse.json({ code: 200, data: conv, message: "success" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}
