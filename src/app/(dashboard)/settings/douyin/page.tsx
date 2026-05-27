"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Store,
  RefreshCw,
  Plus,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react"

interface DouyinShop {
  id: string
  shopName: string
  shopId: string
  authStatus: number // 0=未授权 1=已授权 2=已过期
  lastSyncTime: string | null
  tokenExpire: string | null
  createdAt: string
  updatedAt: string
}

interface SyncResult {
  success: boolean
  shopName?: string
  summary: {
    ordersSynced: number
    productsSynced: number
    ordersSkipped: number
    productsSkipped: number
    errors: string[]
  }
}

export default function DouyinSettingsPage() {
  const [shops, setShops] = useState<DouyinShop[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadShops = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/douyin/shops")
      const data = await res.json()
      if (data.code === 200) {
        setShops(data.data.list || [])
      } else {
        toast.error(data.message || "加载失败")
      }
    } catch (error) {
      toast.error("加载抖店列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadShops()
  }, [loadShops])

  // 处理 OAuth 回调参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authResult = params.get("auth")
    const error = params.get("error")
    const detail = params.get("detail")

    if (authResult === "success") {
      toast.success("抖店授权成功！")
      loadShops()
      // 清除 URL 参数
      window.history.replaceState({}, "", "/settings/douyin")
    }

    if (error) {
      const messages: Record<string, string> = {
        not_configured: "未配置抖店 App Key 和 App Secret",
        no_code: "未获取到授权码",
        auth_failed: detail ? `授权失败: ${detail}` : "授权失败",
      }
      toast.error(messages[error] || `错误: ${error}`)
      window.history.replaceState({}, "", "/settings/douyin")
    }
  }, [loadShops])

  const handleAuthorize = () => {
    window.location.href = "/api/douyin/auth?action=login"
  }

  const handleSync = async (shopId: string) => {
    setSyncing(shopId)
    try {
      const res = await fetch("/api/douyin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, mode: "incremental" }),
      })
      const data = await res.json()

      if (data.code === 200) {
        const result = data.data as SyncResult
        if (result.success) {
          toast.success(
            `同步完成: 订单${result.summary.ordersSynced}条, 商品${result.summary.productsSynced}个`,
          )
        } else {
          toast.warning(
            `同步完成但有错误: ${result.summary.errors.slice(0, 3).join("; ")}`,
          )
        }
        loadShops()
      } else {
        toast.error(data.message || "同步失败")
      }
    } catch (error) {
      toast.error("请求同步失败")
    } finally {
      setSyncing(null)
    }
  }

  const handleSyncAll = async () => {
    setSyncing("all")
    try {
      const res = await fetch("/api/douyin/sync?all=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "incremental" }),
      })
      const data = await res.json()

      if (data.code === 200) {
        toast.success(data.message)
        loadShops()
      } else {
        toast.error(data.message || "同步失败")
      }
    } catch (error) {
      toast.error("全量同步请求失败")
    } finally {
      setSyncing(null)
    }
  }

  const handleDeauthorize = async (shopId: string, shopName: string) => {
    if (!confirm(`确定要解除 ${shopName} 的抖店授权吗？`)) return

    setDeleting(shopId)
    try {
      const res = await fetch(`/api/douyin/shops?shopId=${shopId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.code === 200) {
        toast.success("已解除授权")
        loadShops()
      } else {
        toast.error(data.message || "解除授权失败")
      }
    } catch (error) {
      toast.error("请求失败")
    } finally {
      setDeleting(null)
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            已授权
          </Badge>
        )
      case 2:
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            已过期
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            未授权
          </Badge>
        )
    }
  }

  const formatTime = (time: string | null) => {
    if (!time) return "—"
    return new Date(time).toLocaleString("zh-CN")
  }

  const isTokenExpiring = (tokenExpire: string | null) => {
    if (!tokenExpire) return false
    return new Date(tokenExpire).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            抖店授权管理
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            管理抖店店铺授权，同步商品和订单数据到千策系统
          </p>
        </div>
        <div className="flex items-center gap-2">
          {shops.length > 0 && (
            <Button variant="outline" onClick={handleSyncAll} disabled={syncing === "all"}>
              {syncing === "all" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              全量同步
            </Button>
          )}
          <Button onClick={handleAuthorize}>
            <Plus className="h-4 w-4 mr-2" />
            授权抖店
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">已授权店铺</CardTitle>
          <CardDescription>
            通过抖店 OAuth2.0 授权后，可自动同步店铺的订单和商品数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-12 w-12 mx-auto text-muted-foreground/60" />
              <h3 className="mt-4 text-lg font-medium">暂无已授权的抖店</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                点击"授权抖店"按钮，使用抖店商家账号扫码授权
              </p>
              <Button className="mt-4" onClick={handleAuthorize}>
                <ExternalLink className="h-4 w-4 mr-2" />
                立即授权
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>店铺名称</TableHead>
                  <TableHead>抖店ID</TableHead>
                  <TableHead>授权状态</TableHead>
                  <TableHead>最后同步</TableHead>
                  <TableHead>Token 过期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.shopId}>
                    <TableCell className="font-medium">{shop.shopName}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {shop.shopId}
                    </TableCell>
                    <TableCell>{getStatusBadge(shop.authStatus)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTime(shop.lastSyncTime)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {shop.tokenExpire ? (
                        <span className={isTokenExpiring(shop.tokenExpire) ? "text-amber-500" : "text-muted-foreground"}>
                          {formatTime(shop.tokenExpire)}
                          {isTokenExpiring(shop.tokenExpire) && " ⚠️"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {shop.authStatus === 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleSync(shop.shopId)}
                            disabled={syncing === shop.shopId}
                          >
                            {syncing === shop.shopId ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            同步
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDeauthorize(shop.shopId, shop.shopName)}
                          disabled={deleting === shop.shopId}
                        >
                          {deleting === shop.shopId ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          解除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 配置说明卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">配置说明</CardTitle>
          <CardDescription>
            抖店 API 接入需要完成以下配置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium mb-1">1. 获取 App Key 和 App Secret</p>
            <p className="text-muted-foreground">
              登录{" "}
              <a
                href="https://op.jinritemai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                抖店开放平台
              </a>{" "}
              → 创建应用 → 获取 App Key 和 App Secret
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium mb-1">2. 配置回调地址</p>
            <p className="text-muted-foreground">
              在抖店开放平台设置 OAuth 回调地址为：
              <code className="text-xs bg-background px-1 py-0.5 rounded ml-1">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/douyin/auth?action=callback`
                  : "http://localhost:3000/api/douyin/auth?action=callback"}
              </code>
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium mb-1">3. 设置环境变量</p>
            <p className="text-muted-foreground">
              在 <code className="text-xs bg-background px-1 py-0.5 rounded">.env</code> 中添加：
            </p>
            <pre className="text-xs bg-background px-3 py-2 rounded mt-1 overflow-x-auto">
              {`DOUYIN_APP_KEY=your_app_key_here
DOUYIN_APP_SECRET=your_app_secret_here`}
            </pre>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium mb-1">4. 授权店铺</p>
            <p className="text-muted-foreground">
              完成以上配置后，点击"授权抖店"按钮，使用抖店商家账号扫码授权
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
