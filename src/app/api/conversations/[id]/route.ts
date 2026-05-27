import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/conversations/[id] - 获取对话详情及消息
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })
    if (!conversation) {
      return NextResponse.json({ code: 404, data: null, message: "对话不存在" }, { status: 404 })
    }
    return NextResponse.json({ code: 200, data: conversation, message: "success" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

// PUT /api/conversations/[id] - 更新对话标题
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const conv = await prisma.conversation.update({
      where: { id },
      data: { title: body.title },
    })
    return NextResponse.json({ code: 200, data: conv, message: "success" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

// DELETE /api/conversations/[id] - 删除对话
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.conversation.delete({ where: { id } })
    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}
