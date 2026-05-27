"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  BarChart3,
  Building2,
  Store,
  Package,
  ShoppingCart,
  Files,
  Users,
  Shield,
  Building,
  FileText,
  Truck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  DollarSign,
  Warehouse,
  BookOpen,
  Search,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo, useState } from "react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"

const menuGroups = [
  {
    label: "AI智能",
    items: [
      { href: "/ai/board", label: "AI全域看板", icon: LayoutDashboard },
      { href: "/ai/agent", label: "全部智能体", icon: Bot },
      { href: "/chat", label: "AI对话(新版)", icon: MessageSquare },
    ],
  },
  {
    label: "数据分析",
    items: [
      { href: "/dashboard", label: "综合看板", icon: BarChart3 },
      { href: "/finance/dashboard", label: "财务综合看板", icon: BarChart3 },
      { href: "/finance/revenue", label: "营收分析", icon: BarChart3 },
      { href: "/finance/cost", label: "成本分析", icon: DollarSign },
      { href: "/finance/profit", label: "利润分析", icon: BarChart3 },
      { href: "/finance/reconciliation", label: "对账管理", icon: BookOpen },
    ],
  },
  {
    label: "档案管理",
    items: [
      { href: "/company", label: "公司管理", icon: Building },
      { href: "/shop", label: "店铺管理", icon: Store },
      { href: "/goods/spu", label: "SPU管理", icon: Package },
      { href: "/goods/sku", label: "SKU管理", icon: Package },
      { href: "/goods/category", label: "商品分类", icon: Files },
    ],
  },
  {
    label: "订单管理",
    items: [
      { href: "/order/list", label: "原始订单", icon: ShoppingCart },
      { href: "/order/settlement", label: "结算订单", icon: FileText },
      { href: "/order/refund", label: "售后订单", icon: Truck },
    ],
  },
  {
    label: "库存管理",
    items: [
      { href: "/inventory/overview", label: "库存概览", icon: Warehouse },
    ],
  },
  {
    label: "供应链",
    items: [
      { href: "/supplier", label: "供应商管理", icon: Truck },
      { href: "/contract", label: "合同管理", icon: FileText },
    ],
  },
  {
    label: "系统设置",
    items: [
      { href: "/system/user", label: "用户管理", icon: Users },
      { href: "/system/role", label: "角色管理", icon: Shield },
      { href: "/system/dept", label: "部门管理", icon: Building2 },
      { href: "/system/post", label: "岗位管理", icon: Settings },
      { href: "/settings/douyin", label: "抖店授权", icon: Globe },
    ],
  },
]

/** 构建菜单项 -> 分组/项反向映射 */
function buildMenuMap() {
  const map = new Map<string, { group: string; item: string; icon: React.ComponentType<{ className?: string }> }>()
  for (const group of menuGroups) {
    for (const item of group.items) {
      map.set(item.href, { group: group.label, item: item.label, icon: item.icon })
    }
  }
  return map
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

  const menuMap = useMemo(() => buildMenuMap(), [])
  const currentMenu = menuMap.get(pathname) || menuMap.get(pathname.replace(/\/$/, "")) || null
  const PageIcon = currentMenu?.icon

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 侧边栏 */}
      <aside
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b">
          {!collapsed && (
            <Link href="/ai/board" className="font-bold text-lg tracking-tight">
              千策 QianCe
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* 菜单 — 增加搜索 */}
        <div className="px-2 pt-2">
          <SideMenuSearch collapsed={collapsed} menuGroups={menuGroups} />
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-4">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-2 text-xs font-medium text-muted-foreground mb-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 折叠时的底部品牌标识 */}
        {collapsed && (
          <div className="border-t py-2 text-center">
            <span className="text-[10px] text-muted-foreground">千策</span>
          </div>
        )}
      </aside>

      {/* 主区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶栏 — 增加面包屑导航 */}
        <header className="flex items-center justify-between h-14 px-6 border-b bg-card shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              {currentMenu ? (
                <>
                  <span className="text-muted-foreground hidden sm:inline">千策</span>
                  <span className="text-muted-foreground hidden sm:inline">/</span>
                  <span className="text-muted-foreground hidden sm:inline">{currentMenu.group}</span>
                  <span className="text-muted-foreground hidden sm:inline">/</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    {PageIcon && <PageIcon className="h-4 w-4" />}
                    {currentMenu.item}
                  </span>
                </>
              ) : (
                <span className="font-medium">千策</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "切换亮色模式" : "切换暗色模式"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">陈</AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:inline">陈</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

type MenuGroup = { label: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }

/** 侧边栏菜单搜索组件 */
function SideMenuSearch({ collapsed, menuGroups }: { collapsed: boolean; menuGroups: MenuGroup[] }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const router = usePathname()

  if (collapsed) return null

  const filtered = query.trim()
    ? menuGroups.flatMap(g => g.items.filter(i => i.label.includes(query) || i.href.includes(query)))
    : []

  return (
    <div className="relative mb-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索菜单..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onFocus={() => query && setOpen(true)}
          className="h-8 w-full rounded-md border bg-background pl-8 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md py-1">
          {filtered.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                onClick={() => { setOpen(false); setQuery("") }}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
