/**
 * 千策 AI Completion 服务
 *
 * 提供统一的 LLM 调用接口，支持：
 * 1. 真实 API 调用（OpenAI / MiniMax）
 * 2. Mock 回退（API Key 未配置时自动降级）
 * 3. Agent 系统 Prompt 注入
 * 4. 数据查询工具联动（自动识别数据查询意图并查数据库）
 */

import { getAgentByCode } from "@/lib/agents/router"

// ── 类型 ──────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface CompletionRequest {
  messages: ChatMessage[]
  agentCode?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface CompletionResponse {
  content: string
  agentName?: string
  agentPrompt?: string
  routed: boolean
  mock: boolean
  dataQueried?: boolean
}

// ── Mock 回复集 ────────────────────────────────────

const _ = (s: string) => s // tag for vscode highlighting, no-op

const MOCK_REPLIES: Record<string, (msg: string) => string> = {
  profit_predictor: (msg) =>
    _([
      `📊 **利润预测分析**`,
      ``,
      `根据您的问题"${msg}"，我来进行利润预测分析：`,
      ``,
      `**当前数据概况：**`,
      `- 近30天销售额：¥1,280,000`,
      `- 平均毛利率：42.3%`,
      `- 固定成本：¥185,000/月`,
      `- 可变成本率：35.7%`,
      ``,
      `**预测结果：**`,
      `| 指标 | 本月 | 下月 | 下季度 |`,
      `|------|------|------|--------|`,
      `| 预计营收 | ¥1,350,000 | ¥1,420,000 | ¥4,200,000 |`,
      `| 预计毛利 | ¥571,000 | ¥600,000 | ¥1,780,000 |`,
      `| 净利润率 | 18.5% | 19.2% | 19.8% |`,
      ``,
      `> ⚠️ *这是一个基于演示数据的模拟分析。正式版将接入真实数据。*`,
    ].join("\n")),

  tax_risk_scanner: (msg) =>
    _([
      `🔍 **税务风险扫描报告**`,
      ``,
      `针对"${msg}"的税务风险扫描结果：`,
      ``,
      `**扫描范围：** 2026年Q1`,
      ``,
      `| 风险项 | 状态 | 风险等级 | 建议 |`,
      `|--------|------|---------|------|`,
      `| 收入申报完整性 | ✅ 匹配 | 低 | — |`,
      `| 发票数据一致性 | ⚠️ 异常 | 中 | 3张发票未匹配 |`,
      `| 税负率 | ✅ 合理 | 低 | 2.3%（行业均值2.1%） |`,
      `| 三流一致 | ⚠️ 存疑 | 中 | 1笔合同与资金流不符 |`,
      ``,
      `**整改建议：**`,
      `1. 核实3张未匹配发票（已自动标记）`,
      `2. 补充合同流缺失的1笔资金流水证明`,
      `3. 建议季度末做一次完整盘点`,
      ``,
      `> ⚠️ *模拟数据，正式版接入真实税务数据。*`,
    ].join("\n")),

  auto_reconciliation: (msg) =>
    _([
      `🔄 **自动对账结果**`,
      ``,
      `对账期间：最近一期（模拟数据）`,
      ``,
      `**对账汇总：**`,
      `| 项目 | 系统金额 | 平台金额 | 差异 |`,
      `|------|---------|---------|------|`,
      `| 订单金额 | ¥863,200 | ¥863,200 | ¥0 ✅ |`,
      `| 回款金额 | ¥812,300 | ¥810,500 | ¥1,800 ⚠️ |`,
      `| 退款金额 | ¥38,600 | ¥38,600 | ¥0 ✅ |`,
      `| 平台费用 | ¥56,700 | ¥57,900 | ¥1,200 ⚠️ |`,
      ``,
      `**差异说明：**`,
      `1. 回款差异¥1,800 → 在途资金，预计2个工作日到账`,
      `2. 平台费差异¥1,200 → 推广服务费未计入系统`,
      ``,
      `> ⚠️ *演示数据，正式版接入平台API自动对账。*`,
    ].join("\n")),

  cashflow_predictor: (msg) =>
    _([
      `💰 **现金流预测报告**`,
      ``,
      `预测范围：未来7/30/90天`,
      ``,
      `**7天现金流（¥）：**`,
      "```",
      `今日:  ████████████▎  327,000`,
      `D+1:   ██████████▋    297,000`,
      `D+2:   ███████████▏   312,000`,
      `D+3:   ████████████▌  342,000`,
      `D+4:   ████████████▏  332,000`,
      `D+5:   ███████████▌   318,000`,
      `D+6:   ████████████▉  359,000`,
      "```",
      ``,
      `**预警信息：**`,
      `- ✅ 未来7天无资金缺口风险`,
      `- ℹ️ 下次大额支出：5天后（供应商货款¥158,000）`,
      `- ✅ 可用余额充足`,
      ``,
      `**建议：**`,
      `考虑将多余资金转入活期理财，年化收益约2.3%`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  tax_calculator: (msg) =>
    _([
      `🧮 **税费测算结果**`,
      ``,
      `测算范围：当期（演示数据）`,
      ``,
      `**增值税计算：**`,
      `| 项目 | 金额 |`,
      `|------|------|`,
      `| 销项税额（13%） | ¥166,400 |`,
      `| 进项税额（13%） | ¥98,800 |`,
      `| 应纳增值税 | ¥67,600 |`,
      ``,
      `**企业所得税测算：**`,
      `| 项目 | 金额 |`,
      `|------|------|`,
      `| 会计利润 | ¥357,000 |`,
      `| 纳税调整额 | ¥12,300 |`,
      `| 应纳税所得额 | ¥369,300 |`,
      `| 应纳所得税（25%） | ¥92,325 |`,
      ``,
      `**申报草稿已生成**，请在纳税申报模块查看详情。`,
      ``,
      `> ⚠️ *演示数据，仅供参考。*`,
    ].join("\n")),

  roi_calculator: (msg) =>
    _([
      `🎯 **ROI 保本分析**`,
      ``,
      `根据您的问题"${msg}"，计算结果如下：`,
      ``,
      `**基础参数：**`,
      `- 商品售价：¥129`,
      `- 商品成本：¥58`,
      `- 毛利率：55.0%`,
      `- 转化率：2.3%`,
      ``,
      `**保本ROI计算：**`,
      `| 指标 | 数值 |`,
      `|------|------|`,
      `| 保本ROI | **1.82** |`,
      `| 当前ROI | **3.45** |`,
      `| 安全边际 | +89.6% ✅ |`,
      ``,
      `**建议：**`,
      `当前ROI远高于保本线，建议适当增加投流预算。`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  budget_allocator: (msg) =>
    _([
      `📊 **预算分配方案**`,
      ``,
      `基于各计划近7天ROI表现的预算分配建议：`,
      ``,
      `| 计划名称 | 当前日预算 | 建议日预算 | 调整 | 理由 |`,
      `|---------|-----------|-----------|------|------|`,
      `| 爆款计划A | ¥2,000 | ¥3,500 | +75% | ROI 4.2，持续优化 |`,
      `| 精准计划B | ¥1,500 | ¥2,000 | +33% | ROI 3.8，有上升空间 |`,
      `| 测试计划C | ¥1,000 | ¥500 | -50% | ROI 1.9，低于保本线 |`,
      `| 品牌计划D | ¥3,000 | ¥3,000 | — | 品牌投放，ROI 2.5 |`,
      ``,
      `**共节省/优化：** ¥1,000/天 → 可分配到高ROI计划`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  creative_optimizer: (msg) =>
    _([
      `🎨 **素材优选报告**`,
      ``,
      `素材表现分析（近7天）：`,
      ``,
      `**优质素材（建议加投）：**`,
      `| 素材 | CTR | CVR | 消耗 | 评分 |`,
      `|-----|-----|-----|------|------|`,
      `| 场景展示-A | 4.2% | 3.1% | ¥12,800 | ⭐⭐⭐⭐⭐ |`,
      `| 产品特写-B | 3.8% | 2.9% | ¥9,600 | ⭐⭐⭐⭐ |`,
      ``,
      `**待优化素材（建议迭代）：**`,
      `| 素材 | CTR | CVR | 问题 | 建议 |`,
      `|-----|-----|-----|------|------|`,
      `| 促销横幅-C | 1.2% | 0.8% | 点击低 | 换前3秒钩子 |`,
      `| 口播视频-D | 1.5% | 1.1% | 转化差 | 增加价格锚点 |`,
      ``,
      `**淘汰素材：** 2个（已自动暂停）`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  campaign_monitor: (msg) =>
    _([
      `🔔 **投流监控报告**`,
      ``,
      `当前监控状态：🟢 正常`,
      ``,
      `| 监控项 | 当前值 | 阈值 | 状态 |`,
      `|-------|-------|------|------|`,
      `| 日消耗 | ¥18,500 | ¥25,000 | ✅ |`,
      `| ROI | 3.15 | 2.0 | ✅ |`,
      `| CPM | ¥28.5 | ¥40 | ✅ |`,
      `| 退款率 | 4.2% | 8% | ✅ |`,
      ``,
      `**历史预警记录：**`,
      `- 今日无预警`,
      `- 昨日1条：计划C消耗超速（已自动调整）`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  organic_traffic_booster: (msg) =>
    _([
      `🔍 **自然流量优化方案**`,
      ``,
      `根据您的问题"${msg}"，分析当前商品SEO表现：`,
      ``,
      `**标题诊断：**`,
      `| 商品 | 当前标题 | 优化建议 |`,
      `|------|---------|---------|`,
      `| 商品A | 高品质夏季新款女装 | 2026夏季女装新款 气质V领连衣裙 通勤百搭 → 预估+23%搜索曝光 |`,
      `| 商品B | 家用好物推荐 | 厨房收纳置物架 台面调料架 多功能家用 → 预估+35%搜索曝光 |`,
      ``,
      `**关键词建议：**`,
      `1. 核心词：连衣裙 夏季 女装 V领（搜索指数8.5万/天）`,
      `2. 长尾词：通勤连衣裙 职场穿搭 气质女装（转化率2.8%）`,
      `3. 蓝海词：显瘦V领连衣裙 2026新款（竞争度低+需求上升）`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  product_analyzer: (msg) =>
    _([
      `📦 **商品效能分析**`,
      ``,
      `商品分析范围：全部SKU（演示数据）`,
      ``,
      `**畅销TOP 5：**`,
      `| SKU | 销量 | 毛利率 | 贡献利润 | 状态 |`,
      `|-----|------|--------|---------|------|`,
      `| SKU-001 连衣裙-白-M | 1,280 | 52% | ¥85,000 | 🔥 热销 |`,
      `| SKU-002 连衣裙-黑-M | 1,150 | 55% | ¥81,000 | 🔥 热销 |`,
      `| SKU-003 半身裙-蓝-S | 820 | 48% | ¥49,000 | ⭐ 稳定 |`,
      `| SKU-024 上衣-白-L | 680 | 58% | ¥51,000 | ⭐ 稳定 |`,
      `| SKU-015 外套-灰-M | 350 | 45% | ¥20,000 | 📈 上升 |`,
      ``,
      `**滞销预警：**`,
      `- SKU-031（库存300，30天仅售12件）→ 建议清仓`,
      `- SKU-042（库存180，30天销量0）→ 建议下架`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  competitor_monitor: (msg) =>
    _([
      `👁️ **竞品监控报告**`,
      ``,
      `监控竞品：3个（演示数据）`,
      ``,
      `| 竞品 | 价格变化 | 近7天销量 | 评价变化 | 应对建议 |`,
      `|------|---------|----------|---------|---------|`,
      `| 竞品A | ↓5.0% | 2,300 | +120条 | 关注价格战风险 |`,
      `| 竞品B | — | 1,800 | +85条 | 维持现价策略 |`,
      `| 竞品C | ↑3.0% | 1,200 | +60条 | 可小幅提价跟进 |`,
      ``,
      `**新品预警：**`,
      `竞品A上架2款新品，定价¥99-129，建议关注其销售表现。`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  inventory_optimizer: (msg) =>
    _([
      `📦 **库存优化建议**`,
      ``,
      `当前库存分析（演示数据）：`,
      ``,
      `**周转分析：**`,
      `| SKU | 当前库存 | 近30天销量 | 周转天数 | 建议 |`,
      `|-----|---------|-----------|---------|------|`,
      `| SKU-001 | 500 | 320 | 47天 | ✅ 正常 |`,
      `| SKU-005 | 1,200 | 85 | 424天 | 🚨 滞销，建议清仓 |`,
      `| SKU-012 | 0 | 280 | — | 🚨 缺货，建议补货500件 |`,
      `| SKU-020 | 350 | 150 | 70天 | ⚠️ 偏高，关注动销 |`,
      ``,
      `**补货建议：**`,
      `- SKU-012：立即补货 500 件（安全库存=200，采购周期=7天）`,
      `- SKU-015：一周后补货 300 件（当前库存够用12天）`,
      ``,
      `> ⚠️ *演示模拟数据。*`,
    ].join("\n")),

  data_analyst: (msg) =>
    _([
      `📈 **数据分析结果**`,
      ``,
      `您查询的内容："${msg}"`,
      ``,
      `**数据概览（近30天）：**`,
      "```",
      `销售额:   ████████████████████▎  ¥1,280,000 (+15.3% MoM)`,
      `订单量:   ████████████████████▌  8,450 单 (+12.1% MoM)`,
      `客单价:   ███████████████████▌   ¥151.5  (+2.9% MoM)`,
      `转化率:   ████████████████████▏  3.2%    (+0.3pp)`,
      `退款率:   ██████████▋             2.1%    (-0.1pp)`,
      "```",
      ``,
      `**趋势洞察：**`,
      `- 销售额连续3周稳步上升，主要受新品拉动`,
      `- 客单价略有提升，建议关注高客单价商品组`,
      `- 退款率控制在健康水平`,
      ``,
      `> ⚠️ *演示模拟数据，正式版接入真实数据查询。*`,
    ].join("\n")),

  ops_assistant: (msg) =>
    _([
      `💡 **运营建议**`,
      ``,
      `您好！关于"${msg}"，我为您提供以下参考建议：`,
      ``,
      `**要点分析：**`,
      `这是一项电商运营常见问题。基于行业通用知识，建议如下：`,
      ``,
      `1. ✅ **数据先行** — 先查看相关数据指标，用数据说话`,
      `2. ✅ **用户导向** — 始终从用户/客户体验出发思考方案`,
      `3. ✅ **小步快跑** — 先小范围测试，验证效果好再推广`,
      `4. ✅ **量化结果** — 给每个行动方案设定可衡量的目标`,
      ``,
      `**如果您需要更具体的运营方案，请提供更多信息：**`,
      `- 当前运营阶段`,
      `- 目标用户画像`,
      `- 现有资源预算`,
      `- 主要问题描述`,
      ``,
      `> ℹ️ *当前为通用知识库回复，正式版将结合商家实际数据提供定制建议。*`,
    ].join("\n")),
}

const FALLBACK_REPLY = (msg: string) =>
  [
    `感谢您的提问！关于"${msg}"的问题，千策AI助手正在为您分析。`,
    ``,
    `当前为千策AI演示模式，已识别到您未配置API Key。`,
    ``,
    `**您可以进行的操作：**`,
    `1. **配置API Key** — 在 .env.local 中设置 OPENAI_API_KEY 或 MINIMAX_API_KEY`,
    `2. **继续使用Mock模式** — 当前回复内容为模拟数据，不影响界面交互体验`,
    `3. **查看智能体列表** — 点击左侧智能体菜单，选择特定场景智能体进行对话`,
    ``,
    `如需帮助，请联系千策技术支持。`,
  ].join("\n")

// ── Completion 服务 ──────────────────────────────

/** 检查 API Key 是否真实可用 */
function isRealKey(key: string | undefined): boolean {
  if (!key) return false
  const trimmed = key.trim()
  if (trimmed.length < 8) return false
  if (trimmed === "sk-xxx" || trimmed.startsWith("sk-your")) return false
  return trimmed.startsWith("sk-") || trimmed.startsWith("minimax-")
}

function hasAnyApiKey(): boolean {
  return isRealKey(process.env.OPENAI_API_KEY) || isRealKey(process.env.MINIMAX_API_KEY)
}

// ── 数据查询工具集成 ──────────────────────────────

/**
 * 从数据库查询数据并返回 Markdown 格式的数据上下文
 */
async function tryQueryData(userMessage: string): Promise<string | null> {
  try {
    const { queryDatabaseIntelligence } = await import("@/lib/agents/tools")
    return await queryDatabaseIntelligence(userMessage)
  } catch {
    return null
  }
}

// ── 数据查询工具辅助 Prompt ──────────────────────

const DATA_TOOL_SYSTEM_PROMPT = `## 数据查询能力

你可以从千策系统数据库中查询真实数据来回答用户的问题。
当用户询问销售额、订单量、商品排行、库存等信息时，系统会自动从数据库查询并提供给 AI。

系统会在你收到用户消息前，自动执行相关数据查询（querySales / queryTopProducts / queryOrderStats / queryInventoryAlerts 等），
并将查询结果以 Markdown 表格形式注入到你的输入上下文中。

**你需要做的就是：**
1. 当看到数据上下文中有 "来自数据库的真实数据" 时，基于这些数据回答
2. 用自然语言解读数据，给出业务洞察和建议
3. 如果数据不完整，诚实地告诉用户缺少什么数据
4. 不要编造数据 —— 如果上下文中没有数据，用通用知识回答`

// ── 构建 System Prompt ──────────────────────────

function buildSystemPrompt(agentCode?: string): string {
  let agentPrompt: string

  if (!agentCode) {
    agentPrompt = [
      `你是一位电商智能助手 "千策AI"，精通电商运营、财务、投流、商品管理等领域。`,
      ``,
      `核心能力：`,
      `1. 回答电商相关问题`,
      `2. 提供数据分析和建议`,
      `3. 协助生成运营方案`,
      ``,
      `回答要求：`,
      `- 专业、简洁、有条理`,
      `- 适当使用emoji和Markdown格式`,
      `- 不确定的内容请明确说明是推测`,
    ].join("\n")
  } else {
    const agent = getAgentByCode(agentCode)
    if (!agent) {
      agentPrompt = `你是一位电商智能助手 "千策AI"。`
    } else {
      agentPrompt = [
        `你是一位电商智能助手，当前角色是：${agent.name}`,
        ``,
        agent.prompt,
        ``,
        `回答要求：`,
        `- 保持专业、简洁、有条理`,
        `- 适当使用emoji和Markdown格式`,
        `- 如果是分析类问题，尽量结构化呈现（表格/列表/数据）`,
        `- 不确定的内容请明确说明是推测`,
      ].join("\n")
    }
  }

  return `${agentPrompt}\n\n${DATA_TOOL_SYSTEM_PROMPT}`
}

/**
 * Mock 回复生成器
 */
function generateMockReply(agentCode: string | undefined, userMessage: string): string {
  const replyFn = agentCode ? MOCK_REPLIES[agentCode] : undefined
  if (replyFn) {
    return replyFn(userMessage)
  }
  return FALLBACK_REPLY(userMessage)
}

// ── 核心 Completion 函数 ─────────────────────────

/**
 * 核心 Completion 函数
 *
 * 1. 检查 API Key
 * 2. 有 Key → 检测用户意图 → 查询真实数据 → 调用真实 LLM
 * 3. 无 Key → 返回 Mock 回复
 */
export async function createCompletion(request: CompletionRequest): Promise<CompletionResponse> {
  const { messages, agentCode, temperature = 0.7, maxTokens = 2048 } = request

  const userMessage = messages.find((m) => m.role === "user")?.content || ""
  const agent = agentCode ? getAgentByCode(agentCode) : undefined

  // 构建系统 prompt
  const systemPrompt = buildSystemPrompt(agentCode)

  // ── 无API Key → Mock 回退 ─────────────────────
  if (!hasAnyApiKey()) {
    // 模拟处理延迟
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700))

    return {
      content: generateMockReply(agentCode, userMessage),
      agentName: agent?.name,
      agentPrompt: systemPrompt,
      routed: !!agentCode,
      mock: true,
    }
  }

  // ── 有API Key → 尝试数据查询 → 调用 LLM ──────
  let dataQueried = false
  let dataContext = ""

  try {
    const queryResult = await tryQueryData(userMessage)
    if (queryResult) {
      dataContext = queryResult
      dataQueried = true
    }
  } catch (error) {
    console.warn("[AI Completion] 数据查询失败:", error)
  }

  try {
    const provider = process.env.AI_PRIMARY_PROVIDER || "openai"
    const modelName =
      provider === "openai"
        ? process.env.AI_PRIMARY_MODEL || "gpt-4o-mini"
        : process.env.AI_FALLBACK_MODEL || "minimax-pro"

    // 构建完整消息列表
    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ]

    // 如果有查询到的数据，注入为 assistant 消息（模拟 AI 查到了数据）
    if (dataContext) {
      // 将数据上下文注入到 system prompt 之后，用户消息之前
      fullMessages.splice(1, 0, {
        role: "assistant",
        content: `[系统通知] 我已查询数据库获取以下相关数据：\n${dataContext}\n\n我将基于以上数据回答用户的问题。`,
      })
    }

    if (provider === "minimax") {
      return await callMiniMax(fullMessages, modelName, temperature, maxTokens, agent, systemPrompt, agentCode, dataQueried)
    }

    return await callOpenAI(fullMessages, modelName, temperature, maxTokens, agent, systemPrompt, agentCode, dataQueried)
  } catch (error) {
    console.error("AI completion error:", error)
    // API 调用失败时回退到 Mock
    return {
      content: generateMockReply(agentCode, userMessage),
      agentName: agent?.name,
      agentPrompt: systemPrompt,
      routed: !!agentCode,
      mock: true,
      dataQueried,
    }
  }
}

// ── Provider 调用 ───────────────────────────────

async function callOpenAI(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number,
  agent: { name?: string } | undefined,
  systemPrompt: string,
  agentCode?: string,
  dataQueried = false,
): Promise<CompletionResponse> {
  const url = "https://api.openai.com/v1/chat/completions"
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return {
    content: data.choices?.[0]?.message?.content || "",
    agentName: agent?.name,
    agentPrompt: systemPrompt,
    routed: !!agentCode,
    mock: false,
    dataQueried,
  }
}

async function callMiniMax(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number,
  agent: { name?: string } | undefined,
  systemPrompt: string,
  agentCode?: string,
  dataQueried = false,
): Promise<CompletionResponse> {
  const url = "https://api.minimax.chat/v1/chat/completions"
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    throw new Error(`MiniMax API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return {
    content: data.choices?.[0]?.message?.content || "",
    agentName: agent?.name,
    agentPrompt: systemPrompt,
    routed: !!agentCode,
    mock: false,
    dataQueried,
  }
}

// ── 系统 Prompts 导出（供调试页面使用）──────────

export function getAgentSystemPrompt(agentCode: string): string {
  return buildSystemPrompt(agentCode)
}

export function getAllSystemPrompts(): Record<string, string> {
  const { agents } = require("@/lib/agents/agents")
  const result: Record<string, string> = {}
  for (const agent of agents) {
    result[agent.code] = buildSystemPrompt(agent.code)
  }
  return result
}
