"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { ArrowLeft, Check, X, PackagePlus } from "lucide-react"
import { toast } from "sonner"

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  0: { label: "草稿", variant: "secondary" },
  1: { label: "待审核", variant: "outline" },
  2: { label: "已确认", variant: "default" },
  3: { label: "部分入库", variant: "secondary" },
  4: { label: "已完成", variant: "default" },
  5: { label: "已取消", variant: "destructive" },
}

interface OrderItem {
  id: string
  spuName: string
  skuSpec: string
  quantity: number
  price: number
  priceYuan: string
  receivedQty: number
}

interface OrderDetail {
  id: string
  orderNo: string
  supplierId: string
  supplier: { id: string; name: string; code: string }
  status: number
  totalAmount: number
  totalAmountYuan: string
  paidAmount: number
  paidAmountYuan: string
  freight: number
  freightYuan: string
  remark: string
  creator: string
  createdAt: string
  items: OrderItem[]
}

export default function PurchaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [receiveQty, setReceiveQty] = useState<Record<string, number>>({})

  useEffect(() => {
    loadDetail()
  }, [id])

  const loadDetail = async () => {
    setLoading(true)
    try {
      const data = await api.get<OrderDetail>(`/api/purchase?id=${id}`)
      setOrder(data)
      // 初始化入库数量
      const qty: Record<string, number> = {}
      data.items.forEach((item) => {
        qty[item.id] = item.quantity - item.receivedQty
      })
      setReceiveQty(qty)
    } catch (error) {
      toast.error("加载采购单详情失败")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    try {
      await api.put(`/api/purchase?id=${id}`, { status: 2 })
      toast.success("采购单已确认")
      loadDetail()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleCancel = async () => {
    try {
      await api.put(`/api/purchase?id=${id}`, { status: 5 })
      toast.success("采购单已取消")
      loadDetail()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleReceive = async () => {
    if (!order) return
    try {
      // 更新每个采购项的实际入库数量
      for (const item of order.items) {
        const qty = receiveQty[item.id] || 0
        if (qty > 0) {
          await api.put(`/api/purchase/items?id=${item.id}`, { receivedQty: item.receivedQty + qty })

          // 同时入库到库存
          try {
            await api.post("/api/inventory", {
              skuCode: item.spuName,
              spuName: item.spuName,
              skuSpec: item.skuSpec,
              quantity: qty,
              unit: "个",
            })
          } catch {
            // 库存入库异常不影响采购单状态
          }
        }
      }

      // 检查入库状态
      const allReceived = order.items.every(
        (item) => (item.receivedQty + (receiveQty[item.id] || 0)) >= item.quantity
      )
      const anyReceived = order.items.some(
        (item) => (item.receivedQty + (receiveQty[item.id] || 0)) > 0
      )

      let newStatus = 4 // 已完成
      if (!allReceived && anyReceived) newStatus = 3 // 部分入库
      if (!anyReceived) newStatus = 2 // 还是已确认

      await api.put(`/api/purchase?id=${id}`, { status: newStatus })
      toast.success("入库登记成功")
      setReceiveOpen(false)
      loadDetail()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground">加载中...</div>
  }

  if (!order) {
    return <div className="flex items-center justify-center h-48 text-destructive">采购单不存在</div>
  }

  const canConfirm = order.status === 1
  const canReceive = order.status === 2 || order.status === 3
  const canCancel = order.status === 0 || order.status === 1

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/purchase/list")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{order.orderNo}</h2>
              <Badge variant={statusMap[order.status]?.variant}>
                {statusMap[order.status]?.label || "未知"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              创建于 {new Date(order.createdAt).toLocaleString("zh-CN")} · 创建人: {order.creator}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canConfirm && (
            <Button onClick={handleConfirm}>
              <Check className="h-4 w-4 mr-2" />确认采购单
            </Button>
          )}
          {canReceive && (
            <Button onClick={() => setReceiveOpen(true)}>
              <PackagePlus className="h-4 w-4 mr-2" />入库
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" className="text-destructive" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />取消
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">供应商</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{order.supplier.name}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">采购总额</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">¥{order.totalAmountYuan}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">运费</CardTitle></CardHeader>
          <CardContent><p className="font-medium">¥{order.freightYuan}</p></CardContent>
        </Card>
      </div>

      {order.remark && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">备注</CardTitle></CardHeader>
          <CardContent><p>{order.remark}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">商品明细</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">商品名称</th>
                <th className="text-left py-2 font-medium">规格</th>
                <th className="text-right py-2 font-medium">单价</th>
                <th className="text-right py-2 font-medium">数量</th>
                <th className="text-right py-2 font-medium">小计</th>
                <th className="text-right py-2 font-medium">已入库</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="py-3">{item.spuName || "-"}</td>
                  <td className="py-3">{item.skuSpec || "-"}</td>
                  <td className="py-3 text-right">¥{item.priceYuan}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">¥{(item.price * item.quantity / 100).toFixed(2)}</td>
                  <td className="py-3 text-right">{item.receivedQty}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold text-base">
                <td colSpan={3} className="pt-3 text-right">合计</td>
                <td className="pt-3 text-right">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td className="pt-3 text-right">¥{order.totalAmountYuan}</td>
                <td className="pt-3 text-right">{order.items.reduce((s, i) => s + i.receivedQty, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* 入库弹窗 */}
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>入库登记</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.spuName || "-"}</p>
                  <p className="text-muted-foreground text-xs">已入库 {item.receivedQty}/{item.quantity}</p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={item.quantity - item.receivedQty}
                  className="w-24 h-9 text-right"
                  value={receiveQty[item.id] || 0}
                  onChange={(e) => {
                    const val = Math.min(item.quantity - item.receivedQty, Math.max(0, parseInt(e.target.value) || 0))
                    setReceiveQty({ ...receiveQty, [item.id]: val })
                  }}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveOpen(false)}>取消</Button>
            <Button onClick={handleReceive}>确认入库</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
