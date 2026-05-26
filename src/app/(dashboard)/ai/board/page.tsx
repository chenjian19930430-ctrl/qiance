'use client';

import { Bot, Package, TrendingUp, Shield, Search, Layers, Megaphone, BarChart3, Zap, Globe, Receipt, DollarSign, FileCheck, PieChart, FileText, Calculator, HelpCircle } from 'lucide-react';

const categories = [
  {
    name: '商品管理',
    color: 'bg-emerald-500',
    agents: [
      { name: '商品信息采集助手', description: '全网采集商品信息，自动填充属性', icon: Search },
      { name: '商品上架优化师', description: 'AI优化标题、主图、详情页提升转化', icon: Package },
      { name: 'SKU/SPU管理专家', description: '自动化管理商品层级与分类结构', icon: Layers },
    ],
  },
  {
    name: '投流增长',
    color: 'bg-blue-500',
    agents: [
      { name: '全域投流策略官', description: '制定跨平台广告投放策略', icon: Megaphone },
      { name: '投放素材工厂', description: '批量生成图文/视频广告素材', icon: BarChart3 },
      { name: '智能出价引擎', description: '实时竞价优化，ROI最大化', icon: Zap },
      { name: '达人分销助手', description: '匹配带货达人，管理分销链路', icon: Globe },
      { name: '店铺运营管家', description: '日常巡检、活动报名、数据监控', icon: TrendingUp },
    ],
  },
  {
    name: '财税管理',
    color: 'bg-violet-500',
    agents: [
      { name: '财务记账助手', description: '自动记账、凭证生成、账务核对', icon: Receipt },
      { name: '营收分析报告', description: '多维度营收数据分析与报表输出', icon: DollarSign },
      { name: '费用合规审查', description: '智能审查报销单、发票合规性', icon: FileCheck },
      { name: '利润核算中心', description: '自动分摊成本、计算单品利润', icon: PieChart },
      { name: '税务申报助手', description: '智能计算应缴税款，自动生成申报表', icon: FileText },
      { name: '成本控制看板', description: '实时监控成本异常，预警超支风险', icon: Calculator },
      { name: '税务风控专家', description: '检测税务风险点，提供合规建议', icon: Shield },
    ],
  },
];

export default function AiBoardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI看板</h1>
        <p className="text-muted-foreground text-sm mt-1">智能体分组成员总览</p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-1 h-6 rounded-full ${category.color}`} />
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <span className="text-sm text-muted-foreground">({category.agents.length}个智能体)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.name}
                    className="bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${category.color} bg-opacity-10 text-white`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{agent.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{agent.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
