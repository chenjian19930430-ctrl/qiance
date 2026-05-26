'use client';

import { Bot, Package, TrendingUp, Shield, Search, Layers, Megaphone, BarChart3, Zap, Globe, Receipt, DollarSign, FileCheck, PieChart, FileText, Calculator } from 'lucide-react';

const agents = [
  { name: '商品信息采集助手', category: '商品管理', icon: Search, desc: '全网采集商品信息，自动填充属性' },
  { name: '商品上架优化师', category: '商品管理', icon: Package, desc: 'AI优化标题、主图、详情页提升转化' },
  { name: 'SKU/SPU管理专家', category: '商品管理', icon: Layers, desc: '自动化管理商品层级与分类结构' },
  { name: '全域投流策略官', category: '投流增长', icon: Megaphone, desc: '制定跨平台广告投放策略' },
  { name: '投放素材工厂', category: '投流增长', icon: BarChart3, desc: '批量生成图文/视频广告素材' },
  { name: '智能出价引擎', category: '投流增长', icon: Zap, desc: '实时竞价优化，ROI最大化' },
  { name: '达人分销助手', category: '投流增长', icon: Globe, desc: '匹配带货达人，管理分销链路' },
  { name: '店铺运营管家', category: '投流增长', icon: TrendingUp, desc: '日常巡检、活动报名、数据监控' },
  { name: '财务记账助手', category: '财税管理', icon: Receipt, desc: '自动记账、凭证生成、账务核对' },
  { name: '营收分析报告', category: '财税管理', icon: DollarSign, desc: '多维度营收数据分析与报表输出' },
  { name: '费用合规审查', category: '财税管理', icon: FileCheck, desc: '智能审查报销单、发票合规性' },
  { name: '利润核算中心', category: '财税管理', icon: PieChart, desc: '自动分摊成本、计算单品利润' },
  { name: '税务申报助手', category: '财税管理', icon: FileText, desc: '智能计算应缴税款，自动生成申报表' },
  { name: '成本控制看板', category: '财税管理', icon: Calculator, desc: '实时监控成本异常，预警超支风险' },
  { name: '税务风控专家', category: '财税管理', icon: Shield, desc: '检测税务风险点，提供合规建议' },
];

const categoryColors: Record<string, string> = {
  '商品管理': 'bg-emerald-500',
  '投流增长': 'bg-blue-500',
  '财税管理': 'bg-violet-500',
};

export default function AiAgentPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">智能体列表</h1>
        <p className="text-muted-foreground text-sm mt-1">全部智能体一览</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">智能体名称</th>
              <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">分类</th>
              <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">描述</th>
              <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">状态</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <tr key={agent.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${categoryColors[agent.category]} text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{agent.category}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{agent.desc}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">在线</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
