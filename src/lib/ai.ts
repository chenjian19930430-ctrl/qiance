/**
 * AI SDK 配置 - Vercel AI SDK
 * 支持 OpenAI 和 MiniMax 模型
 */

// 模型配置
export const aiConfig = {
  // 主力模型
  primary: {
    provider: process.env.AI_PRIMARY_PROVIDER || "openai",
    model: process.env.AI_PRIMARY_MODEL || "gpt-4o-mini",
  },
  // 备选模型
  fallback: {
    provider: process.env.AI_FALLBACK_PROVIDER || "minimax",
    model: process.env.AI_FALLBACK_MODEL || "minimax-pro",
  },
}

export async function getChatModel(provider?: string) {
  const useProvider = provider || aiConfig.primary.provider

  if (useProvider === "minimax") {
    // MiniMax 配置
    const { createOpenAI } = await import("@ai-sdk/openai")
    const minimax = createOpenAI({
      baseURL: "https://api.minimax.chat/v1",
      apiKey: process.env.MINIMAX_API_KEY,
    })
    return minimax(aiConfig.fallback.model)
  }

  // OpenAI 配置
  const { openai } = await import("@ai-sdk/openai")
  return openai(aiConfig.primary.model)
}
