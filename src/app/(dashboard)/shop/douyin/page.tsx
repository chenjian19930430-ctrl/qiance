"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * 抖店管理 — 重定向到抖店授权管理页面
 * 统一入口，便于侧边栏菜单跳转
 */
export default function DouyinShopPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/settings/douyin")
  }, [router])
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">跳转到抖店管理...</span>
    </div>
  )
}
