import { agents, AgentConfig } from "./agents"

/**
 * Agent Router：根据用户输入路由到对应的智能体
 */
export function routeToAgent(userMessage: string): AgentConfig {
  const lowerMsg = userMessage.toLowerCase()

  // 按关键词匹配度排序
  const scored = agents.map((agent) => {
    const score = agent.keywords.reduce((acc, kw) => {
      return acc + (lowerMsg.includes(kw) ? 1 : 0)
    }, 0)
    return { agent, score }
  })

  // 按得分降序排列
  scored.sort((a, b) => b.score - a.score)

  // 最高分且>0则路由到该智能体，否则返回默认（数据分析智能体）
  const best = scored[0]
  if (best && best.score > 0) {
    return best.agent
  }

  // 默认智能体：data_analyst
  return agents.find((a) => a.code === "data_analyst") || agents[0]
}

/**
 * 根据code获取智能体配置
 */
export function getAgentByCode(code: string): AgentConfig | undefined {
  return agents.find((a) => a.code === code)
}

/**
 * 根据分组获取智能体列表
 */
export function getAgentsByGroup(group: string): AgentConfig[] {
  return agents.filter((a) => a.group === group)
}
