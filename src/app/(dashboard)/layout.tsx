'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Bot,
  MessageSquare,
  PieChart,
  Building2,
  Store,
  Package,
  BarChart3,
  ShoppingCart,
  Warehouse,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Shield,
  TrendingUp,
  DollarSign,
  FileText,
  HelpCircle,
  Globe,
  Calculator,
  Receipt,
  FileCheck,
  Search,
  Layers,
  Megaphone,
  Zap,
} from 'lucide-react';
import { useTheme } from 'next-themes';

// 菜单结构
interface MenuItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuItem[];
}

const menuGroups: { title: string; items: MenuItem[] }[] = [
  {
    title: '概览',
    items: [
      { title: 'AI看板', icon: LayoutDashboard, path: '/dashboard' },
      { title: 'AI驾驶舱', icon: Cpu, path: '/ai/board' },
    ],
  },
  {
    title: 'AI智能体',
    items: [
      { title: '智能体列表', icon: Bot, path: '/ai/agent' },
      { title: 'AI对话', icon: MessageSquare, path: '/ai/chat' },
    ],
  },
  {
    title: '财税中心',
    items: [
      { title: '财务综合看板', icon: PieChart, path: '/finance/dashboard' },
      { title: '营收分析', icon: TrendingUp, path: '/finance/revenue' },
      { title: '成本分析', icon: Receipt, path: '/finance/cost' },
      { title: '利润分析', icon: DollarSign, path: '/finance/profit' },
      { title: '财务对账', icon: FileCheck, path: '/finance/reconciliation' },
    ],
  },
  {
    title: '业务管理',
    items: [
      { title: '公司管理', icon: Building2, path: '/company' },
      { title: '店铺管理', icon: Store, path: '/shop' },
      { title: '商品管理', icon: Package, path: '/goods/spu' },
      { title: 'SKU管理', icon: Layers, path: '/goods/sku' },
      { title: '商品分类', icon: Search, path: '/goods/category' },
      { title: '订单管理', icon: ShoppingCart, path: '/order/list' },
      { title: '售后订单', icon: FileText, path: '/order/refund' },
      { title: '结算订单', icon: Calculator, path: '/order/settlement' },
    ],
  },
  {
    title: '供应链',
    items: [
      { title: '库存概览', icon: Warehouse, path: '/inventory/overview' },
      { title: '供应商管理', icon: Globe, path: '/supplier' },
      { title: '合同管理', icon: FileText, path: '/contract' },
    ],
  },
  {
    title: '系统管理',
    items: [
      { title: '用户管理', icon: Users, path: '/system/user' },
      { title: '角色管理', icon: Shield, path: '/system/role' },
      { title: '部门管理', icon: Building2, path: '/system/dept' },
      { title: '岗位管理', icon: Settings, path: '/system/post' },
    ],
  },
];

const iconSize = 18;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(menuGroups.map((g) => g.title)));
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleGroup = (title: string) => {
    const next = new Set(expandedGroups);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setExpandedGroups(next);
  };

  const isActive = (path?: string) => path && pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-60'
        } bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out shrink-0`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2 px-4 h-14 border-b border-slate-700/50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">千</span>
          </div>
          {!collapsed && <span className="font-semibold text-base">千策AI</span>}
        </div>

        {/* 菜单 */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-2 px-2">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${
                      expandedGroups.has(group.title) ? '' : '-rotate-90'
                    }`}
                  />
                  {group.title}
                </button>
              )}
              {(expandedGroups.has(group.title) || collapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.title}
                      href={item.path || '#'}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon size={iconSize} className="shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 折叠按钮 */}
        <div className="border-t border-slate-700/50 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶栏 */}
        <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            {/* 面包屑或当前页面 */}
          </div>
          <div className="flex items-center gap-3">
            {/* 通知 */}
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {/* 暗色模式 */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* 用户信息 */}
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                陈
              </div>
              <span className="text-sm font-medium">陈剑</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
