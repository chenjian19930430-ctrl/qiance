import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/chat
// 无参数 → 返回所有会话列表
// ?id=xxx → 返回单个会话及其消息
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (id) {
      // 获取单个会话
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
      if (!conversation) {
        return NextResponse.json({ code: 404, data: null, message: "会话不存在" }, { status: 404 })
      }
      return NextResponse.json({ code: 200, data: conversation, message: "success" })
    }

    // 获取会话列表
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    })
    return NextResponse.json({ code: 200, data: conversations, message: "success" })
  } catch (error) {
    console.error("[Chat GET]", error)
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

// POST /api/chat
// 创建新会话 或 发送消息到已有会话
// 创建: { action: "create", title, agentId? }
// 发送: { action: "send", conversationId, content }
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ── 创建新会话 ──
    if (body.action === "create") {
      const conv = await prisma.conversation.create({
        data: {
          userId: body.userId || "default",
          title: body.title || "新对话",
          agentId: body.agentId || null,
          status: 0,
          tenantId: body.tenantId || "default",
        },
      })
      return NextResponse.json({ code: 200, data: conv, message: "创建成功" })
    }

    // ── 发送消息（非流式） ──
    if (body.action === "send") {
      const { conversationId, content } = body
      if (!conversationId || !content) {
        return NextResponse.json({ code: 400, data: null, message: "缺少会话ID或消息内容" }, { status: 400 })
      }

      // 保存用户消息
      await prisma.chatMessage.create({
        data: {
          conversationId,
          userId: body.userId || "default",
          role: "user",
          content,
        },
      })

      // 更新会话主题（用第一条用户消息作为标题）
      const msgCount = await prisma.chatMessage.count({ where: { conversationId, role: "user" } })
      if (msgCount === 1) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { title: content.slice(0, 50), updatedAt: new Date() },
        })
      } else {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        })
      }

      // 调用 AI 回复
      try {
        const aiReply = await callAI(content)

        const msg = await prisma.chatMessage.create({
          data: {
            conversationId,
            userId: body.userId || "default",
            role: "assistant",
            content: aiReply,
          },
        })

        return NextResponse.json({ code: 200, data: { message: msg, content: aiReply }, message: "success" })
      } catch (aiError) {
        // AI 调用失败，保存错误回复
        const errMsg = aiError instanceof Error ? aiError.message : "AI 服务暂时不可用"
        const msg = await prisma.chatMessage.create({
          data: {
            conversationId,
            userId: body.userId || "default",
            role: "assistant",
            content: `⚠️ ${errMsg}`,
          },
        })
        return NextResponse.json({ code: 200, data: { message: msg, content: msg.content }, message: "success" })
      }
    }

    return NextResponse.json({ code: 400, data: null, message: "未知操作" }, { status: 400 })
  } catch (error) {
    console.error("[Chat POST]", error)
    return NextResponse.json({ code: 500, data: null, message: "操作失败" }, { status: 500 })
  }
}

// DELETE /api/chat?id=xxx - 删除会话（级联删除消息）
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    await prisma.conversation.delete({ where: { id } })
    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    console.error("[Chat DELETE]", error)
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}

// PUT /api/chat?id=xxx - 更新会话（重命名）
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }
    const body = await req.json()
    const conv = await prisma.conversation.update({ where: { id }, data: { title: body.title } })
    return NextResponse.json({ code: 200, data: conv, message: "更新成功" })
  } catch (error) {
    console.error("[Chat PUT]", error)
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

// ── AI 调用函数 ──
async function callAI(content: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.MINIMAX_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

  if (!apiKey) {
    // 无 API Key 时返回模拟回复
    const mockReplies = [
      "收到您的消息！我是千策AI助手，当前未配置API Key，这是模拟回复。",
      `关于"${content.slice(0, 30)}"的问题，我已经记录下来。请配置 OPENAI_API_KEY 环境变量以启用真实对话。`,
      "您好！千策AI已收到您的提问。请设置API Key后我将为您提供更精准的答案。",
    ]
    return mockReplies[Math.floor(Math.random() * mockReplies.length)]
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "你是一个专业的电商AI助手，帮助用户分析数据、管理商品、优化运营。请用中文回答，简洁专业。" },
        { role: "user", content },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`AI API 错误 (${res.status}): ${errText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || "抱歉，我没有理解您的问题。"
}
