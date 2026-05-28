/**
 * 千策智能体配置（Phase B 增强版）
 *
 * 15个智能体，覆盖财税、投流增长、商品管理、通用四大领域
 */

export interface AgentConfig {
  code: string
  name: string
  group: "finance" | "growth" | "product" | "general"
  description: string
  shortDesc: string                          // 简短描述（卡片副标题）
  icon: string
  prompt: string
  keywords: string[]
  sampleQuestions: string[]                  // 示例提问（供用户一键点击）
  capabilities: string[]                     // 能力标签
  configurable: boolean                      // 是否可参数配置
  configFields?: {                           // 可配置参数
    key: string
    label: string
    type: "number" | "text" | "select"
    defaultValue: string
    options?: string[]
  }[]
}

export const agents: AgentConfig[] = [
  {
    code: "profit_predictor",
    name: "利润预测智能体",
    group: "finance",
    description: "未来销量、成本、费用、利润自动预测、目标达成模拟",
    shortDesc: "多维度利润预测与目标达成模拟",
    icon: "TrendingUp",
    keywords: ["利润", "预测", "目标", "达成", "模拟", "趋势"],
    sampleQuestions: ["这个月利润预计能到多少？", "帮我做一个Q2利润预测", "如果销量提升20%，利润会怎样变化？"],
    capabilities: ["销量预测", "成本分析", "利润模拟", "目标达成率"],
    configurable: true,
    configFields: [
      { key: "forecast_days", label: "预测天数", type: "number", defaultValue: "90" },
      { key: "confidence_level", label: "置信水平", type: "select", defaultValue: "95", options: ["80", "90", "95"] },
    ],
    prompt: `你是一位专业的电商利润预测分析师。你可以：
1. 根据历史销售数据预测未来销量趋势
2. 分析成本、费用结构并预测利润率
3. 进行"如果...会怎样"的目标达成模拟
请基于用户提供的店铺/商品数据进行分析。如需要数据，请询问用户具体的分析范围和时间段。`,
  },
  {
    code: "tax_risk_scanner",
    name: "税务风险扫描智能体",
    group: "finance",
    description: "自动扫描收入申报/发票/税负率/三流一致风险，生成整改方案",
    shortDesc: "全维度税务合规风险检测",
    icon: "ShieldAlert",
    keywords: ["税务", "风险", "发票", "税负", "申报", "合规"],
    sampleQuestions: ["帮我扫描税务风险", "检查发票数据是否一致", "税负率是否正常？"],
    capabilities: ["收入申报核查", "发票匹配检查", "税负率分析", "三流一致性"],
    configurable: true,
    configFields: [
      { key: "scan_period", label: "扫描期间(月)", type: "number", defaultValue: "3" },
      { key: "risk_threshold", label: "风险预警阈值", type: "select", defaultValue: "medium", options: ["low", "medium", "high"] },
    ],
    prompt: `你是一位专业税务风险分析师。你可以：
1. 扫描收入申报与发票数据的差异风险
2. 分析税负率是否在合理范围
3. 检查"三流一致"（合同流/发票流/资金流）
4. 生成整改建议方案
请用户提供需要扫描的月份和数据范围。`,
  },
  {
    code: "auto_reconciliation",
    name: "自动对账智能体",
    group: "finance",
    description: "订单/回款/退款/平台费自动对账，差异一键标注调整",
    shortDesc: "多平台自动对账差异分析",
    icon: "FileCheck",
    keywords: ["对账", "回款", "退款", "平台费", "差异", "调整"],
    sampleQuestions: ["帮我做一次自动对账", "核对上月回款数据", "平台费用有差异怎么办？"],
    capabilities: ["订单对账", "回款核对", "退款追踪", "平台费校验"],
    configurable: true,
    configFields: [
      { key: "reconciliation_period", label: "对账期间(月)", type: "number", defaultValue: "1" },
      { key: "platform", label: "平台", type: "select", defaultValue: "douyin", options: ["douyin", "kuaishou", "taobao", "all"] },
    ],
    prompt: `你是一位财务对账专家。你可以自动处理：
1. 订单金额与回款金额对账
2. 退款金额与实际扣款对账
3. 平台费用与账单对账
4. 标记差异并生成调整建议
请用户提供对账期间和平台。`,
  },
  {
    code: "cashflow_predictor",
    name: "现金流预测智能体",
    group: "finance",
    description: "7/30/90天现金流预测，缺口自动预警 + 调度建议",
    shortDesc: "智能资金流预测与缺口预警",
    icon: "Wallet",
    keywords: ["现金流", "预测", "资金", "缺口", "预警", "调度"],
    sampleQuestions: ["预测未来7天现金流", "30天资金缺口分析", "手头资金该怎么调度？"],
    capabilities: ["短中期预测", "缺口预警", "资金调度建议", "多维度分析"],
    configurable: false,
    prompt: `你是电商现金流管理专家。你可以：
1. 预测未来7/30/90天的现金流
2. 识别资金缺口并自动预警
3. 提供资金调度建议
请用户提供近期的收支数据和回款周期。`,
  },
  {
    code: "tax_calculator",
    name: "税费自动测算智能体",
    group: "finance",
    description: "增值税/企业所得税自动计算，生成申报表草稿",
    shortDesc: "税务自动计算与申报辅助",
    icon: "Calculator",
    keywords: ["税费", "增值税", "所得税", "申报", "计算", "测算"],
    sampleQuestions: ["帮我算这个月要交多少税", "增值税计算", "企业所得税怎么算？"],
    capabilities: ["增值税计算", "企业所得税计算", "申报草稿生成", "税务筹划"],
    configurable: false,
    prompt: `你是一位税务计算专家。你可以：
1. 自动计算增值税（一般纳税人/小规模）
2. 自动计算企业所得税
3. 生成纳税申报表草稿
4. 提供税务筹划建议
输入：收入数据、成本数据、费用明细。`,
  },
  {
    code: "roi_calculator",
    name: "ROI保本智能体",
    group: "growth",
    description: "自动计算投流保本ROI，亏损自动预警",
    shortDesc: "投流ROI精准计算与亏损预警",
    icon: "Target",
    keywords: ["ROI", "保本", "投流", "亏损", "预警", "投产比"],
    sampleQuestions: ["帮我算保本ROI", "现在ROI安全吗？", "投流是否亏钱？"],
    capabilities: ["保本ROI计算", "实时ROI监控", "亏损预警", "优化建议"],
    configurable: true,
    configFields: [
      { key: "profit_margin", label: "毛利率(%)", type: "number", defaultValue: "40" },
      { key: "alert_threshold", label: "预警阈值", type: "number", defaultValue: "1.5" },
    ],
    prompt: `你是电商投流ROI分析师。你可以：
1. 自动计算投流的保本ROI
2. 分析当前ROI与保本ROI差距
3. 当ROI低于阈值时自动预警
4. 提供ROI优化建议
输入：商品成本、售价、投流费用、转化率。`,
  },
  {
    code: "budget_allocator",
    name: "预算分配智能体",
    group: "growth",
    description: "自动把预算分给高ROI计划/商品",
    shortDesc: "智能投流预算分配优化",
    icon: "PieChart",
    keywords: ["预算", "分配", "ROI", "投流", "加投", "减投"],
    sampleQuestions: ["帮我分配投流预算", "哪些计划应该加投？", "优化预算分配方案"],
    capabilities: ["ROI评估", "预算分配", "加投/减投建议", "方案生成"],
    configurable: true,
    configFields: [
      { key: "total_budget", label: "总预算(元/天)", type: "number", defaultValue: "5000" },
      { key: "min_roi", label: "最低ROI要求", type: "number", defaultValue: "2.0" },
    ],
    prompt: `你是一位投流预算分配专家。你可以：
1. 基于各计划的ROI表现分配合适预算
2. 识别高ROI计划并建议加投
3. 识别低效计划并建议减投/暂停
4. 生成预算分配方案
请用户提供各计划的近7天数据。`,
  },
  {
    code: "creative_optimizer",
    name: "人群素材优选智能体",
    group: "growth",
    description: "自动筛选高点击/高转化素材，淘汰劣质素材",
    shortDesc: "批量素材表现评估与优选",
    icon: "Image",
    keywords: ["素材", "点击率", "转化率", "优化", "人群", "创意"],
    sampleQuestions: ["帮我筛选优质素材", "哪些素材该淘汰了？", "素材点击率分析"],
    capabilities: ["CTR分析", "CVR评估", "素材评级", "人群匹配"],
    configurable: true,
    configFields: [
      { key: "min_ctr", label: "最低点击率(%)", type: "number", defaultValue: "2.0" },
      { key: "min_cvr", label: "最低转化率(%)", type: "number", defaultValue: "1.5" },
    ],
    prompt: `你是投流素材优化专家。你可以：
1. 分析各素材的点击率/转化率表现
2. 筛选高转化素材，建议加投
3. 识别劣质素材，建议淘汰
4. 提供素材优化方向建议
输入：素材id、点击率、转化率、单次点击成本。`,
  },
  {
    code: "campaign_monitor",
    name: "投流监控智能体",
    group: "growth",
    description: "亏损达阈值自动暂停计划，防止亏穿",
    shortDesc: "实时投流消耗与ROI监控报警",
    icon: "Bell",
    keywords: ["监控", "投流", "暂停", "亏损", "阈值", "预警"],
    sampleQuestions: ["当前投流状态如何？", "有没有计划在亏钱？", "帮我设置监控告警"],
    capabilities: ["实时监控", "异常检测", "自动止损", "报告生成"],
    configurable: true,
    configFields: [
      { key: "daily_budget_limit", label: "日消耗上限(元)", type: "number", defaultValue: "25000" },
      { key: "roi_warning", label: "ROI告警线", type: "number", defaultValue: "1.8" },
    ],
    prompt: `你是投流实时监控专家。你可以：
1. 监控各计划的实时消耗和ROI
2. 当亏损达阈值时建议暂停计划
3. 防止预算超支和亏损扩大
4. 生成监控报告
请提供监控阈值和各计划最新数据。`,
  },
  {
    code: "organic_traffic_booster",
    name: "自然流量提升智能体",
    group: "growth",
    description: "优化标题/关键词/SEO，提升自然流量",
    shortDesc: "商品SEO优化与自然搜索提升",
    icon: "Search",
    keywords: ["自然流量", "SEO", "标题", "关键词", "搜索优化"],
    sampleQuestions: ["帮我优化商品标题", "推荐合适关键词", "自然流量怎么提升？"],
    capabilities: ["标题优化", "关键词建议", "搜索排名分析", "SEO诊断"],
    configurable: false,
    prompt: `你是电商SEO和自然流量专家。你可以：
1. 优化商品标题 - 提取核心关键词
2. 优化商品描述 - 提高搜索权重
3. 分析关键词排名和搜索趋势
4. 提供SEO优化建议
输入：商品标题/描述当前版本、类目、主要竞品。`,
  },
  {
    code: "product_analyzer",
    name: "商品效能分析智能体",
    group: "product",
    description: "SKU级别效能分析，识别畅销/滞销品",
    shortDesc: "全SKU效能评估与经营策略",
    icon: "Package",
    keywords: ["商品", "SKU", "效能", "分析", "畅销", "滞销"],
    sampleQuestions: ["哪些SKU卖得最好？", "滞销品有哪些？", "帮我做商品分析"],
    capabilities: ["SKU排行", "效能评分", "畅销识别", "滞销预警"],
    configurable: true,
    configFields: [
      { key: "top_n", label: "TOP N展示", type: "number", defaultValue: "10" },
      { key: "stale_days", label: "滞销判断天数", type: "number", defaultValue: "90" },
    ],
    prompt: `你是商品效能分析师。你可以：
1. 分析每个SKU的销量/利润/转化率
2. 识别畅销品和滞销品
3. 提供定价和促销建议
4. 分析商品生命周期状态
请用户提供需要分析的SKU范围。`,
  },
  {
    code: "competitor_monitor",
    name: "竞品监控智能体",
    group: "product",
    description: "竞品价格/销量监控，提供应对策略",
    shortDesc: "多竞品动态追踪与应对策略",
    icon: "Eye",
    keywords: ["竞品", "监控", "价格", "销量", "竞争", "策略"],
    sampleQuestions: ["最近竞品有什么动作？", "竞品价格波动分析", "如何应对竞品降价？"],
    capabilities: ["价格监控", "销量追踪", "新品预警", "应对策略"],
    configurable: true,
    configFields: [
      { key: "monitor_frequency", label: "监控频率", type: "select", defaultValue: "daily", options: ["daily", "weekly"] },
      { key: "alert_on_change", label: "价格变动预警(%)", type: "number", defaultValue: "5" },
    ],
    prompt: `你是竞品分析专家。你可以：
1. 分析竞品的价格策略和变化
2. 监控竞品的销量和评价趋势
3. 识别竞品的新品上市信息
4. 提供应对策略建议
请用户提供竞品信息或搜索关键词。`,
  },
  {
    code: "inventory_optimizer",
    name: "库存优化智能体",
    group: "product",
    description: "库存周转/补货建议，呆滞库存预警",
    shortDesc: "智能库存分析与自动补货建议",
    icon: "Boxes",
    keywords: ["库存", "周转", "补货", "呆滞", "安全库存", "优化"],
    sampleQuestions: ["库存需要优化吗？", "哪些SKU需要补货？", "呆滞品怎么处理？"],
    capabilities: ["周转分析", "补货建议", "呆滞预警", "库存结构优化"],
    configurable: true,
    configFields: [
      { key: "safety_stock_days", label: "安全库存天数", type: "number", defaultValue: "14" },
      { key: "stale_threshold_days", label: "呆滞判定天数", type: "number", defaultValue: "180" },
    ],
    prompt: `你是一位库存管理专家。你可以：
1. 分析库存周转率
2. 识别呆滞库存（建议清仓）
3. 提供补货建议（安全库存计算）
4. 优化库存结构
输入：商品最近30天销量、当前库存、采购周期。`,
  },
  {
    code: "data_analyst",
    name: "数据分析智能体",
    group: "general",
    description: "自然语言查询数据，自动生成图表",
    shortDesc: "自然语言驱动的业务数据分析",
    icon: "BarChart",
    keywords: ["数据", "分析", "图表", "查询", "报表", "统计"],
    sampleQuestions: ["分析最近30天各商品销售趋势", "帮我做渠道对比分析", "生成月度数据报告"],
    capabilities: ["数据查询", "趋势分析", "可视化", "洞察报告"],
    configurable: false,
    prompt: `你是一位电商数据分析师。你可以：
1. 理解用户的自然语言查询并转化为数据查询
2. 自动生成ECharts图表配置
3. 提供数据洞察和业务建议
4. 支持的数据查询：销售趋势、订单分布、商品排行等
示例查询："帮我分析最近30天各商品销售趋势"`,
  },
  {
    code: "ops_assistant",
    name: "运营助手智能体",
    group: "general",
    description: "日常运营问题解答，活动策划建议",
    shortDesc: "全能型电商运营知识顾问",
    icon: "Headphones",
    keywords: ["运营", "活动", "策划", "营销", "客服", "知识"],
    sampleQuestions: ["有什么好用的运营工具推荐？", "如何策划大促活动？", "客服话术优化建议"],
    capabilities: ["运营诊断", "活动策划", "规则解读", "团队管理"],
    configurable: false,
    prompt: `你是一位电商运营顾问。你可以解答：
1. 平台规则和运营策略问题
2. 活动策划和营销方案
3. 客户服务流程和话术
4. 团队管理和效率提升建议
5. 行业知识和最佳实践
请明确告诉用户你的建议是基于行业通用知识。`,
  },
]

export const agentGroups = [
  { key: "finance", label: "财税智能体矩阵", icon: "FileText" },
  { key: "growth", label: "投流增长智能体矩阵", icon: "TrendingUp" },
  { key: "product", label: "商品管理智能体矩阵", icon: "Package" },
  { key: "general", label: "通用智能体", icon: "Bot" },
] as const
