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
  Smartphone,
  BarChart3,
  ShoppingCart,
  Package,
} from "lucide-react"

interface WeixinShop {
  id: string
  shopName: string
  shopId: string
  authStatus: number
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

/* ── 状态标签 ── */
function AuthStatusBadge({ status }: { status: number }) {
  switch (status) {
    case 1:
      return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />已授权</Badge>
    case 2:
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />已过期</Badge>
    default:
      return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />未授权</Badge>
  }
}

export default function WeixinSettingsPage() {
  const [shops, setShops] = useState<WeixinShop[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<Record<string, boolean>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/weixin/shops")
      const json = await res.json()
      if (json.code === 200) setShops(json.data)
    } catch {
      toast.error("获取视频号店铺列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchShops() }, [fetchShops])

  /* ── 授权跳转 ── */
  const handleAuthorize = () => {
    window.location.href = "/api/weixin/auth?action=login"
  }

  /* ── 同步 ── */
  const handleSync = async (shopId: string) => {
    setSyncing((prev) => ({ ...prev, [shopId]: true }))
    try {
      const res = await fetch("/api/weixin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, mode: "incremental" }),
      })
      const json = await res.json()
      const r: SyncResult = json.data
      if (r.success) {
        toast.success(`${r.shopName || "视频号"} 同步完成`, {
          description: `订单${r.summary.ordersSynced}条 / 商品${r.summary.productsSynced}个`,
        })
      } else {
        toast.error(`同步失败`, {
          description: r.summary.errors.join("; "),
        })
      }
    } catch {
      toast.error("同步请求失败")
    } finally {
      setSyncing((prev) => ({ ...prev, [shopId]: false }))
      fetchShops()
    }
  }

  const handleSyncAll = async () => {
    setSyncing((prev) => ({ ...prev, all: true }))
    try {
      const res = await fetch("/api/weixin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "incremental" }),
      })
      const json = await res.json()
      const results: SyncResult[] = json.data || []
      const successCount = results.filter((r) => r.success).length
      toast.success(`批量同步完成`, {
        description: `${successCount}/${results.length} 个店铺同步成功`,
      })
    } catch {
      toast.error("批量同步请求失败")
    } finally {
      setSyncing((prev) => ({ ...prev, all: false }))
      fetchShops()
    }
  }

  /* ── 解除授权 ── */
  const handleDeauthorize = async (shopId: string) => {
    try {
      const res = await fetch(`/api/weixin/auth?shopId=${shopId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.code === 200) {
        toast.success("已解除授权")
        setDeleteConfirm(null)
        fetchShops()
      } else {
        toast.error(json.message || "解除授权失败")
      }
    } catch {
      toast.error("解除授权请求失败")
    }
  }

  /* ── 首页统计卡片 ── */
  const authorizedShops = shops.filter((s) => s.authStatus === 1)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-green-600" />
            视频号小店管理
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            授权管理微信视频号店铺，支持订单/商品同步
          </p>
        </div>
        <div className="flex gap-2">
          {authorizedShops.length > 0 && (
            <Button variant="outline" onClick={handleSyncAll} disabled={syncing.all}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing.all ? "animate-spin" : ""}`} />
              {syncing.all ? "同步中..." : "同步全部"}
            </Button>
          )}
          <Button onClick={handleAuthorize}>
            <Plus className="w-4 h-4 mr-2" />
            添加视频号授权
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">视频号店铺</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-500" />
              {shops.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">已授权</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {authorizedShops.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">待同步</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-yellow-500" />
              {authorizedShops.filter((s) => !s.lastSyncTime).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">运营数据</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart className="w-4 h-4 text-gray-400" /> 同步订单
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-gray-400" /> 同步商品
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 店铺列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">授权店铺列表</CardTitle>
          <CardDescription>
            添加视频号授权后，可自动同步订单和商品数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg mb-2">暂无视频号店铺</p>
              <p className="text-sm mb-4">点击「添加视频号授权」开始授权绑定</p>
              <Button onClick={handleAuthorize}>
                <Plus className="w-4 h-4 mr-2" />
                添加视频号授权
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>店铺名称</TableHead>
                    <TableHead>店铺ID</TableHead>
                    <TableHead>授权状态</TableHead>
                    <TableHead>最后同步</TableHead>
                    <TableHead>Token到期</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.shopName}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{shop.shopId}</TableCell>
                      <TableCell><AuthStatusBadge status={shop.authStatus} /></TableCell>
                      <TableCell>
                        {shop.lastSyncTime
                          ? new Date(shop.lastSyncTime).toLocaleString("zh-CN")
                          : <span className="text-muted-foreground">从未同步</span>
                        }
                      </TableCell>
                      <TableCell>
                        {shop.tokenExpire
                          ? new Date(shop.tokenExpire).toLocaleString("zh-CN")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>{new Date(shop.createdAt).toLocaleDateString("zh-CN")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {shop.authStatus === 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(shop.shopId)}
                              disabled={syncing[shop.shopId]}
                            >
                              <RefreshCw className={`w-3 h-3 mr-1 ${syncing[shop.shopId] ? "animate-spin" : ""}`} />
                              {syncing[shop.shopId] ? "同步中" : "同步"}
                            </Button>
                          )}
                          {deleteConfirm === shop.shopId ? (
                            <>
                              <Button variant="destructive" size="sm" onClick={() => handleDeauthorize(shop.shopId)}>
                                确认解除
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                                取消
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(shop.shopId)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />解除
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* 操作帮助 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">操作说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">1.</span>
            <span>点击「添加视频号授权」跳转到微信开放平台 OAuth 授权页</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">2.</span>
            <span>使用微信扫码或账号登录完成授权，自动跳转回本页面</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">3.</span>
            <span>授权完成后，点击「同步」按钮手动触发商品和订单同步</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">4.</span>
            <span>Token 过期后需要重新授权，系统会自动检测并在列表标注「已过期」</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">5.</span>
            <span>解除授权后店铺数据保留在系统中，可随时重新绑定</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
