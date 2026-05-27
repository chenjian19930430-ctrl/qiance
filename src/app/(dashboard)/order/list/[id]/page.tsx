"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Truck, FileText, DollarSign, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderItem {
  id: string
  skuName: string
  shopId: string | null
  skuId: string | null
  quantity: number
  unitPrice: number | string
  subtotal: number | string
  createdAt: string
}

interface Order {
  id: string
  orderNo: string
  channel: string | null
  type: number
  orderStatus: number
  totalAmount: number | string
  discountAmount: number | string
  realAmount: number | string
  platformFee: number | string
  logisticsFee: number | string
  buyerName: string | null
  buyerPhone: string | null
  buyerAddress: string | null
  remark: string | null
  orderTime: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

const orderStatusMap: Record<number, string> = {
  0: "待发货",
  1: "已发货",
  2: "已完成",
  3: "已取消",
  4: "售后中",
}

const statusColorMap: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  2: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  3: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  4: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = params.id as string
    if (!id) return

    setLoading(true)
    api.get<Order>(`/api/order?id=${id}`)
      .then(setOrder)
      .catch((e) => setError(e.message || "加载失败"))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled><ArrowLeft className="h-4 w-4" /></Button>
          <Skeleton className="h-8 w-48" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-32" /></CardContent></Card>
        ))}
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-12 text-center">
        <p className="text-destructive text-lg">{error || "订单不存在"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>返回</Button>
      </div>
    )
  }

  const fmt = (v: number | string | undefined | null) => `¥${(Number(v || 0)).toFixed(2)}`
  const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleString("zh-CN") : "-"

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">订单详情</h2>
            <p className="text-sm text-muted-foreground">订单号: {order.orderNo}</p>
          </div>
        </div>
        <Badge className={`text-sm px-3 py-1 ${statusColorMap[order.orderStatus] || ""}`}>
          {orderStatusMap[order.orderStatus] || "未知"}
        </Badge>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> 订单信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">订单号：</span>{order.orderNo}</div>
            <div><span className="text-muted-foreground">下单时间：</span>{fmtDate(order.orderTime)}</div>
            <div><span className="text-muted-foreground">渠道：</span>{order.channel || "-"}</div>
            <div><span className="text-muted-foreground">买家：</span>{order.buyerName || "-"}</div>
            <div><span className="text-muted-foreground">买家电话：</span>{order.buyerPhone || "-"}</div>
            <div><span className="text-muted-foreground">买家备注：</span>{order.remark || "-"}</div>
          </div>
        </CardContent>
      </Card>

      {/* 商品明细 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> 商品明细</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">商品名称</th>
                <th className="text-right p-3 font-medium">单价</th>
                <th className="text-right p-3 font-medium">数量</th>
                <th className="text-right p-3 font-medium">小计</th>
              </tr>
            </thead>
            <tbody>
              {order.items.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">暂无商品明细</td></tr>
              ) : (
                order.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3">{item.skuName}</td>
                    <td className="p-3 text-right">{fmt(item.unitPrice)}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right font-medium">{fmt(item.subtotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 收货信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" /> 收货信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">收货人：</span>{order.buyerName || "-"}</div>
            <div><span className="text-muted-foreground">联系电话：</span>{order.buyerPhone || "-"}</div>
            <div className="col-span-3"><span className="text-muted-foreground">收货地址：</span>{order.buyerAddress || "-"}</div>
          </div>
        </CardContent>
      </Card>

      {/* 金额信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" /> 金额信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">商品金额</span><span>{fmt(order.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">优惠金额</span><span className="text-green-600">-{fmt(order.discountAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">平台佣金</span><span>{fmt(order.platformFee)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">物流运费</span><span>{fmt(order.logisticsFee)}</span></div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>实付金额</span>
              <span className="text-destructive">{fmt(order.realAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作记录 - 简化版（基于 updateAt） */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> 操作记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span><span className="text-muted-foreground">创建时间：</span>{fmtDate(order.createdAt)}</span>
              <span className="text-muted-foreground">订单创建</span>
            </div>
            <div className="flex justify-between">
              <span><span className="text-muted-foreground">最后更新：</span>{fmtDate(order.updatedAt)}</span>
              <span className="text-muted-foreground">状态更新为「{orderStatusMap[order.orderStatus] || "未知"}」</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
