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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"

const menuGroups = [
  {
    label: "AI智能",
    items: [
      { href: "/ai/board", label: "AI全域看板", icon: LayoutDashboard },
      { href: "/ai/agent", label: "全部智能体", icon: Bot },
      { href: "/ai/chat", label: "AI对话", icon: MessageSquare },
    ],
  },
  {
    label: "数据分析",
    items: [
      { href: "/dashboard", label: "综合看板", icon: BarChart3 },
      { href: "/finance/dashboard", label: "财务综合看板", icon: BarChart3 },
      { href: "/finance/revenue", label: "营收分析", icon: BarChart3 },
      { href: "/finance/profit", label: "利润分析", icon: BarChart3 },
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
    ],
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

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
            <Link href="/ai/board" className="font-bold text-lg">
              千策 QianCe
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* 菜单 */}
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
                  const isActive = pathname.startsWith(item.href)
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
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* 主区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶栏 */}
        <header className="flex items-center justify-between h-14 px-6 border-b bg-card">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">
              {menuGroups
                .flatMap((g) => g.items)
                .find((i) => pathname.startsWith(i.href))
                ?.label || "千策"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>陈</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">陈</span>
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
