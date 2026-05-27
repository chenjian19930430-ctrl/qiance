/**
 * POST /api/ai/chat
 *
 * AI 对话接口（增强版：支持全局路由 + 页面上下文感知）
 *
 * 对标八爪鱼的全局指令来源路由：
 * - AI 对话是全局入口，用户任何操作都可以通过对话完成
 * - 可选的 pagePath 参数让 AI 知道用户当前所在页面，提供上下文相关回答
 * - AI 可调用所有数据查询工具
 *
 * Request:
 * {
 *   messages: ChatMessage[],       // 对话历史
 *   agentCode?: string,            // 可选，智能体编码
 *   pagePath?: string,             // 可选，用户当前所在页面路径
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
 *   tools?: string[],              // 已调用的工具列表
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { createCompletion } from "@/lib/ai/completion"

// ── 页面上下文映射 ──────────────────────────────

const PAGE_CONTEXT_MAP: Record<string, { label: string; tools: string[]; prompt: string }> = {
  "/dashboard": {
    label: "综合看板",
    tools: ["querySales", "queryTopProducts", "queryOrderStats", "queryInventoryAlerts"],
    prompt: "用户当前在综合看板页面，关注整体经营状况、趋势分析和数据概览。",
  },
  "/ai/board": {
    label: "AI全域看板",
    tools: ["querySales", "queryTopProducts", "queryOrderStats", "queryInventoryAlerts", "queryShops"],
    prompt: "用户当前在AI全域看板页面，倾向于通过自然语言查询数据和获取洞察。",
  },
  "/agents": {
    label: "全部智能体",
    tools: [],
    prompt: "用户当前在全部智能体列表页，可能在浏览或选择智能体。",
  },
  "/chat": {
    label: "AI对话",
    tools: ["querySales", "queryTopProducts", "queryOrderStats", "queryInventoryAlerts", "queryShops"],
    prompt: "用户正在使用AI深度对话功能，可以进行复杂的数据查询和分析。",
  },
  "/ai/peekaboo": {
    label: "Peekaboo浏览器控制",
    tools: ["peekaboo_capture", "peekaboo_see", "peekaboo_click", "peekaboo_type", "peekaboo_open_url", "peekaboo_press", "peekaboo_hotkey", "peekaboo_scroll"],
    prompt: "用户当前在Peekaboo浏览器控制页面，可以使用截图看页面、点击、输入等浏览器自动化操作。",
  },
  "/order/list": {
    label: "原始订单",
    tools: ["queryOrderStats", "querySales"],
    prompt: "用户当前在订单管理页面，关注订单状态、数量和金额。",
  },
  "/order/settlement": {
    label: "结算订单",
    tools: ["queryOrderStats"],
    prompt: "用户当前在结算订单页面，关注已结算的订单数据。",
  },
  "/order/refund": {
    label: "售后订单",
    tools: ["queryOrderStats"],
    prompt: "用户当前在售后订单页面，关注退款和售后数据。",
  },
  "/inventory/overview": {
    label: "库存概览",
    tools: ["queryInventoryAlerts"],
    prompt: "用户当前在库存管理页面，关注库存状态、补货预警和呆滞品。",
  },
  "/finance/dashboard": {
    label: "财务综合看板",
    tools: ["querySales", "queryOrderStats"],
    prompt: "用户当前在财务看板页面，关注财务数据和营收分析。",
  },
  "/goods/spu": {
    label: "SPU管理",
    tools: ["queryTopProducts"],
    prompt: "用户当前在商品管理页面，关注SPU/SKU管理和商品表现。",
  },
  "/goods/sku": {
    label: "SKU管理",
    tools: ["queryTopProducts"],
    prompt: "用户当前在SKU管理页面，关注SKU级别的商品数据。",
  },
}

/**
 * 根据页面路径获取上下文信息
 */
function getPageContext(pagePath: string | undefined): { context: string; tools: string[] } | null {
  if (!pagePath) return null

  // 精确匹配
  if (PAGE_CONTEXT_MAP[pagePath]) {
    const ctx = PAGE_CONTEXT_MAP[pagePath]
    return { context: ctx.prompt, tools: ctx.tools }
  }

  // 前缀匹配
  for (const [prefix, info] of Object.entries(PAGE_CONTEXT_MAP)) {
    if (pagePath.startsWith(prefix)) {
      return { context: info.prompt, tools: info.tools }
    }
  }

  return null
}

// ── POST 处理器 ──────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, agentCode, stream, pagePath } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages 是必填项，且不能为空数组" },
        { status: 400 },
      )
    }

    let enhancedMessages = messages

    // 注入页面上下文到第一条消息
    if (pagePath) {
      const pageCtx = getPageContext(pagePath)
      if (pageCtx) {
        const contextMessage = {
          role: "system" as const,
          content: `[页面上下文] ${pageCtx.context}\n用户可以使用的数据查询工具: ${pageCtx.tools.join(", ") || "无"}\n请根据用户的当前页面上下文提供相关的回答。`,
        }
        enhancedMessages = [contextMessage, ...messages]
      }
    }

    const result = await createCompletion({
      messages: enhancedMessages,
      agentCode,
      stream,
    })

    return NextResponse.json({
      ...result,
      pagePath: pagePath || null,
    })
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
