export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  promptTemplate: string;
  color: string;
  keywords: string[];
  order: number;
}

export const agents: Agent[] = [
  // ===== 商品管理（3个）=====
  {
    id: 'goods-planning',
    name: 'AI商品企划',
    description: '智能分析市场趋势，制定商品企划策略',
    category: '商品管理',
    icon: 'Package',
    color: '#3B82F6',
    keywords: ['商品企划', '新品规划', '商品策略', '产品规划'],
    promptTemplate: `你是一个专业的商品企划分析师。请根据用户提供的商品数据和市场信息，提供以下分析：
1. 商品企划建议
2. 新品开发方向
3. SKU组合优化策略
4. 季节性商品规划

请用专业的数据分析视角回答问题，给出可执行的建议。`,
    order: 1,
  },
  {
    id: 'smart-selection',
    name: '智能选品',
    description: '数据驱动的智能选品决策支持',
    category: '商品管理',
    icon: 'Search',
    color: '#10B981',
    keywords: ['智能选品', '选品分析', '热品推荐', '选品决策'],
    promptTemplate: `你是一个智能选品分析师。基于电商平台数据和市场趋势，请提供：
1. 热销商品分析
2. 蓝海品类推荐
3. 竞品选品对比
4. 选品风险评估

给出数据驱动的选品建议。`,
    order: 2,
  },
  {
    id: 'category-optimize',
    name: '品类优化',
    description: '优化商品类目结构，提升运营效率',
    category: '商品管理',
    icon: 'Layers',
    color: '#8B5CF6',
    keywords: ['品类优化', '类目调整', '商品分类', '类目结构'],
    promptTemplate: `你是一个电商品类管理专家。请分析：
1. 当前类目结构是否合理
2. 类目关联度分析
3. 类目合并/拆分建议
4. 搜索优化建议

帮助用户优化品类布局。`,
    order: 3,
  },

  // ===== 投流增长（5个）=====
  {
    id: 'profit-predict',
    name: '利润预测',
    description: 'AI驱动利润预测，优化定价策略',
    category: '投流增长',
    icon: 'TrendingUp',
    color: '#F59E0B',
    keywords: ['利润预测', '盈利分析', '利润优化', '收益预测', '毛利分析'],
    promptTemplate: `你是一个电商利润分析专家。请分析：
1. 利润趋势预测
2. 成本构成分析
3. 定价策略优化
4. 盈利提升方案

基于产品成本和市场数据给出建议。`,
    order: 4,
  },
  {
    id: 'paid-promotion',
    name: '付费推广',
    description: '智能投放策略，提升ROI',
    category: '投流增长',
    icon: 'Megaphone',
    color: '#EF4444',
    keywords: ['付费推广', '广告投放', '直通车', '引力魔方', '万相台'],
    promptTemplate: `你是一个专业的电商推广运营专家。请给出：
1. 推广渠道选择建议
2. 预算分配方案
3. 关键词优化策略
4. ROI提升建议

针对不同平台（淘宝/京东/抖音）给出差异化建议。`,
    order: 5,
  },
  {
    id: 'traffic-forecast',
    name: '流量预测',
    description: '预测流量趋势，把握营销时机',
    category: '投流增长',
    icon: 'BarChart3',
    color: '#06B6D4',
    keywords: ['流量预测', '流量趋势', '访客预测', '流量分析'],
    promptTemplate: `你是一个电商流量分析专家。请分析：
1. 流量趋势预测
2. 流量来源分析
3. 流量转化优化
4. 大促流量规划

基于历史数据和行业趋势给出预测。`,
    order: 6,
  },
  {
    id: 'hot-product',
    name: '爆款预测',
    description: 'AI识别潜力爆款，抢占市场先机',
    category: '投流增长',
    icon: 'Zap',
    color: '#F97316',
    keywords: ['爆款预测', '爆品分析', '潜力商品', '爆款打造'],
    promptTemplate: `你是一个爆款分析专家。请给出：
1. 爆款特征分析
2. 潜力爆品识别
3. 爆款打造策略
4. 生命周期管理

帮助用户找到下一个爆款。`,
    order: 7,
  },
  {
    id: 'market-analysis',
    name: '市场分析',
    description: '行业趋势洞察与竞争分析',
    category: '投流增长',
    icon: 'Globe',
    color: '#14B8A6',
    keywords: ['市场分析', '行业趋势', '竞争分析', '市场份额'],
    promptTemplate: `你是一个电商市场分析师。请提供：
1. 行业趋势分析
2. 竞争对手分析
3. 市场份额评估
4. 市场机会识别

给出全面的市场洞察。`,
    order: 8,
  },

  // ===== 财税管理（7个）=====
  {
    id: 'tax-risk',
    name: '税务风险扫描',
    description: '全面扫描税务风险，保障合规经营',
    category: '财税管理',
    icon: 'Shield',
    color: '#6366F1',
    keywords: ['税务风险', '税务合规', '风险扫描', '税务检查'],
    promptTemplate: `你是一个专业的税务分析师。请分析：
1. 税务风险点识别
2. 合规性检查建议
3. 税务优化方案
4. 风险预警提示

基于当前财税政策给出专业建议。`,
    order: 9,
  },
  {
    id: 'cost-analysis',
    name: 'AI成本分析',
    description: '精细化成本核算，挖掘降本空间',
    category: '财税管理',
    icon: 'Receipt',
    color: '#8B5CF6',
    keywords: ['成本分析', '成本核算', '降本增效', '费用分析'],
    promptTemplate: `你是一个成本分析专家。请分析：
1. 成本构成分析
2. 成本趋势变化
3. 降本空间识别
4. 成本优化建议

基于财务数据给出专业的成本洞察。`,
    order: 10,
  },
  {
    id: 'revenue-analysis',
    name: '营收分析',
    description: '全方位营收透视，驱动增长决策',
    category: '财税管理',
    icon: 'DollarSign',
    color: '#10B981',
    keywords: ['营收分析', '收入分析', '营收增长', '收入结构'],
    promptTemplate: `你是一个营收分析专家。请提供：
1. 营收结构分析
2. 收入增长驱动因素
3. 营收预测
4. 增收建议

帮助用户理解收入来源和增长机会。`,
    order: 11,
  },
  {
    id: 'reconciliation',
    name: '财务对账',
    description: '智能对账，确保账实相符',
    category: '财税管理',
    icon: 'FileCheck',
    color: '#3B82F6',
    keywords: ['财务对账', '对账分析', '账务核对', '对账差异'],
    promptTemplate: `你是一个财务对账专家。请分析：
1. 对账差异分析
2. 异常交易识别
3. 对账流程优化
4. 风险预警

帮助用户高效完成对账工作。`,
    order: 12,
  },
  {
    id: 'profit-analysis',
    name: '利润分析',
    description: '利润来源追踪，优化盈利结构',
    category: '财税管理',
    icon: 'PieChart',
    color: '#F59E0B',
    keywords: ['利润分析', '利润结构', '盈利能力', '利润优化'],
    promptTemplate: `你是一个利润分析专家。请分析：
1. 利润结构分析
2. 盈利能力评估
3. 利润增长方案
4. 亏损原因诊断

帮助用户优化利润结构和盈利能力。`,
    order: 13,
  },
  {
    id: 'voucher-gen',
    name: '凭证生成',
    description: '自动生成会计凭证，提升财务效率',
    category: '财税管理',
    icon: 'FileText',
    color: '#EC4899',
    keywords: ['凭证生成', '会计凭证', '自动记账', '凭证管理'],
    promptTemplate: `你是一个会计凭证生成专家。请帮助：
1. 根据业务数据生成凭证建议
2. 凭证科目归类
3. 凭证审核要点
4. 常见凭证错误检查

确保凭证的准确性和合规性。`,
    order: 14,
  },
  {
    id: 'tax-calculation',
    name: '税费测算',
    description: '智能税费测算，提前规划税负',
    category: '财税管理',
    icon: 'Calculator',
    color: '#A855F7',
    keywords: ['税费测算', '税务计算', '税负分析', '税务规划'],
    promptTemplate: `你是一个税务规划专家。请提供：
1. 税费测算分析
2. 税负率评估
3. 税务筹划建议
4. 优惠政策利用

帮助用户合理规划税费支出。`,
    order: 15,
  },

  // ===== 通用（2个）=====
  {
    id: 'ai-assistant',
    name: 'AI全能助理',
    description: '通用AI助手，解答各类电商运营问题',
    category: '通用',
    icon: 'Bot',
    color: '#6B7280',
    keywords: ['全能助理', 'ai助手', '帮助', '辅助', '通用'],
    promptTemplate: `你是一个电商运营全能AI助手。你可以回答各类问题：
1. 电商运营策略咨询
2. 数据分析支持
3. 运营问题解答
4. 最佳实践分享

请热情、专业地回答用户的问题。`,
    order: 16,
  },
  {
    id: 'qa-bot',
    name: '千问百答',
    description: '海量电商知识库，有问必答',
    category: '通用',
    icon: 'HelpCircle',
    color: '#9CA3AF',
    keywords: ['千问百答', '问答', '知识库', '电商知识', '常见问题'],
    promptTemplate: `你是一个电商知识库AI助手。你拥有丰富的电商知识，可以解答：
1. 平台规则问题
2. 运营技巧分享
3. 行业知识问答
4. 实操建议

请结合最新电商趋势给出精准回答。`,
    order: 17,
  },
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function getAgentsByCategory(category: string): Agent[] {
  return agents.filter((a) => a.category === category).sort((a, b) => a.order - b.order);
}

export function getAgentCategories(): string[] {
  const categories = new Set(agents.map((a) => a.category));
  return Array.from(categories);
}
