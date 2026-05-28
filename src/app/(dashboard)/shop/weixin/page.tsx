"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * 视频号管理 — 重定向到视频号授权管理页面
 */
export default function WeixinShopPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/settings/weixin")
  }, [router])
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">跳转到视频号管理...</span>
    </div>
  )
}
