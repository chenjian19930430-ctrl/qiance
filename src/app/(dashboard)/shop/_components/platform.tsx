import { Store, ShoppingBag, BarChart3, RefreshCw, ExternalLink, Settings, TrendingUp, Users, Package, DollarSign, AlertTriangle, CheckCircle2, Clock, Loader2, Eye, Search, Filter, Download, MoreHorizontal, Edit, Trash2, Plus, MessageSquare } from "lucide-react"

export const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  douyin: Store,
  video: MessageSquare,
  taobao: ShoppingBag,
  kuaishou: TrendingUp,
}

export const platformNames: Record<string, string> = {
  douyin: "抖店",
  video: "视频号",
  taobao: "淘宝",
  kuaishou: "快手",
}

export const platformColors: Record<string, string> = {
  douyin: "text-black dark:text-white",
  video: "text-green-500",
  taobao: "text-orange-500",
  kuaishou: "text-blue-500",
}

export const platformBgColors: Record<string, string> = {
  douyin: "bg-gray-100 dark:bg-gray-800",
  video: "bg-green-50 dark:bg-green-950",
  taobao: "bg-orange-50 dark:bg-orange-950",
  kuaishou: "bg-blue-50 dark:bg-blue-950",
}

export type PlatformShop = {
  id: string
  name: string
  platformId: string
  status: "active" | "inactive" | "expired"
  lastSync: string | null
  tokenExpire: string | null
  createdAt: string
  metrics?: {
    todayOrders: number
    todayRevenue: number
    weekOrders: number
    weekRevenue: number
    productCount: number
    followerCount: number
  }
}

export function getStatusBadge(status: string) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    active: {
      label: "已授权",
      icon: <CheckCircle2 className="h-3 w-3" />,
      cls: "text-green-600 bg-green-50 dark:bg-green-950 border-green-200",
    },
    inactive: {
      label: "未授权",
      icon: <Clock className="h-3 w-3" />,
      cls: "text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200",
    },
    expired: {
      label: "已过期",
      icon: <AlertTriangle className="h-3 w-3" />,
      cls: "text-red-600 bg-red-50 dark:bg-red-950 border-red-200",
    },
  }
  const s = map[status] || map.inactive
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  )
}

export function formatTime(time: string | null) {
  if (!time) return "—"
  return new Date(time).toLocaleString("zh-CN")
}

export function isTokenExpiring(tokenExpire: string | null) {
  if (!tokenExpire) return false
  return new Date(tokenExpire).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
}
