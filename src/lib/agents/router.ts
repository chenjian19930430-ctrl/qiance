import { agents, type Agent } from './agents';

export interface RouterResult {
  agent: Agent;
  confidence: number;
}

/**
 * 根据用户输入的关键词，匹配最合适的智能体
 * 返回匹配度最高的智能体列表（按置信度降序）
 */
export function routeToAgent(input: string): RouterResult[] {
  const lowercaseInput = input.toLowerCase();
  const results: RouterResult[] = [];

  for (const agent of agents) {
    let score = 0;

    // 关键词匹配
    for (const keyword of agent.keywords) {
      if (lowercaseInput.includes(keyword.toLowerCase())) {
        score += 20;
      }
    }

    // 分类匹配
    if (agent.category === '商品管理' && /商品|产品|sku|spu|类目/.test(lowercaseInput)) {
      score += 10;
    }
    if (agent.category === '投流增长' && /投流|推广|流量|广告|利润/.test(lowercaseInput)) {
      score += 10;
    }
    if (agent.category === '财税管理' && /财税|税务|成本|利润|对账|凭证/.test(lowercaseInput)) {
      score += 10;
    }

    if (score > 0) {
      results.push({ agent, confidence: score });
    }
  }

  // 按置信度降序排序
  results.sort((a, b) => b.confidence - a.confidence);

  // 如果没有匹配，返回AI全能助理
  if (results.length === 0) {
    const defaultAgent = agents.find((a) => a.id === 'ai-assistant');
    if (defaultAgent) {
      results.push({ agent: defaultAgent, confidence: 1 });
    }
  }

  return results;
}

/**
 * 构建完整的AI对话系统Prompt
 */
export function buildAgentPrompt(agent: Agent, userMessage: string): string {
  return `
## 角色
你是【${agent.name}】—— ${agent.description}

## 核心职责
${agent.promptTemplate}

## 用户输入
${userMessage}

## 回答要求
1. 专业、准确、实用
2. 给出具体可操作的建议
3. 如需数据分析，明确指出需要哪些数据
4. 保持清晰的结构化回复
`;
}
