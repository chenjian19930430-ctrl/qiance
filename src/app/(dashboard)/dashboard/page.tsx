'use client';

import { LayoutDashboard, DollarSign, ShoppingCart, TrendingUp, Users, Package, ArrowUp, ArrowDown, Bot, Store, FileText, PieChart } from 'lucide-react';

const kpiCards = [
  {
    title: '今日交易额',
    value: '¥128,456.00',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: '今日订单量',
    value: '1,284',
    change: '+8.3%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: '今日访客',
    value: '3,592',
    change: '-2.1%',
    trend: 'down',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: '利润率',
    value: '32.8%',
    change: '+1.2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const shortcuts = [
  { label: 'AI看板', icon: Bot, href: '/ai/board', color: 'bg-indigo-500' },
  { label: '商品管理', icon: Package, href: '/goods/sku', color: 'bg-emerald-500' },
  { label: '订单管理', icon: ShoppingCart, href: '/order/list', color: 'bg-blue-500' },
  { label: '店铺管理', icon: Store, href: '/shop', color: 'bg-cyan-500' },
  { label: '财务看板', icon: PieChart, href: '/finance/dashboard', color: 'bg-violet-500' },
  { label: '库存概览', icon: LayoutDashboard, href: '/inventory/overview', color: 'bg-amber-500' },
  { label: '供应商管理', icon: Users, href: '/supplier', color: 'bg-rose-500' },
  { label: '合同管理', icon: FileText, href: '/contract', color: 'bg-slate-500' },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold">AI运营总览</h1>
        <p className="text-muted-foreground text-sm mt-1">今日经营数据概览</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? ArrowUp : ArrowDown;
          const trendColor = card.trend === 'up' ? 'text-green-600' : 'text-red-600';
          return (
            <div key={card.title} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs">
                <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                <span className={trendColor}>{card.change}</span>
                <span className="text-muted-foreground">较昨日</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Shortcuts */}
      <div>
        <h2 className="text-lg font-semibold mb-3">快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className={`p-2.5 rounded-lg ${item.color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
