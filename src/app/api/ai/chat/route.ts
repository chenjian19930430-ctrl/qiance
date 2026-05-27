/**
 * POST /api/ai/chat
 *
 * AI 对话接口
 * 接收用户消息 + 智能体选择 → 返回 AI 回复
 *
 * Request:
 * {
 *   messages: ChatMessage[],       // 对话历史
 *   agentCode?: string,            // 可选，智能体编码
 *   stream?: boolean,              // 是否流式返回
 * }
 *
 * Response:
 * {
 *   content: string,               // AI 回复内容
 *   agentName?: string,            // 智能体名称
 *   agentPrompt?: string,          // 系统 Prompt（调试用）
 *   routed: boolean,               // 是否路由到智能体
 *   mock: boolean,                 // 是否为 Mock 回复
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { createCompletion } from "@/lib/ai/completion"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, agentCode, stream } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages 是必填项，且不能为空数组" },
        { status: 400 },
      )
    }

    const result = await createCompletion({
      messages,
      agentCode,
      stream,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[AI Chat API]", error)
    return NextResponse.json(
      {
        error: "AI 对话服务异常",
        detail: error instanceof Error ? error.message : "未知错误",
        mock: true,
        content: "AI 对话服务暂时不可用，请稍后再试。",
      },
      { status: 500 },
    )
  }
}
