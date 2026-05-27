"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Plus, Trash2, Save, Send } from "lucide-react"
import { toast } from "sonner"

interface Supplier {
  id: string
  name: string
  code: string
}

interface PurchaseItem {
  spuName: string
  skuSpec: string
  quantity: number
  price: number
  spuId?: string
  skuId?: string
}

export default function CreatePurchasePage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierId, setSupplierId] = useState("")
  const [remark, setRemark] = useState("")
  const [items, setItems] = useState<PurchaseItem[]>([
    { spuName: "", skuSpec: "", quantity: 1, price: 0 },
  ])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get<{ list: Supplier[]; total: number }>("/api/supplier", { page: 1, pageSize: 100 })
      .then((res) => setSuppliers(res.list))
      .catch(() => toast.error("加载供应商失败"))
  }, [])

  const addItem = () => {
    setItems([...items, { spuName: "", skuSpec: "", quantity: 1, price: 0 }])
  }

  const removeItem = (idx: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: keyof PurchaseItem, value: any) => {
    const newItems = items.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async (status: number) => {
    if (!supplierId) {
      toast.error("请选择供应商")
      return
    }
    if (items.some((item) => !item.spuName.trim())) {
      toast.error("请填写商品名称")
      return
    }

    setSubmitting(true)
    try {
      const result = await api.post<{ id: string }>("/api/purchase", {
        supplierId,
        status,
        remark,
        items: items.map((item) => ({
          spuName: item.spuName,
          skuSpec: item.skuSpec,
          quantity: item.quantity,
          price: Math.round(item.price * 100), // 转为分
          spuId: item.spuId,
          skuId: item.skuId,
        })),
        creator: "admin",
      })
      toast.success(status === 0 ? "已保存为草稿" : "已提交审核")
      router.push(`/purchase/${result.id}`)
    } catch (error: any) {
      toast.error(error.message || "创建失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">新建采购单</h2>
        <p className="text-sm text-muted-foreground mt-1">创建新的采购订单</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">供应商 <span className="text-destructive">*</span></label>
              <select
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">选择供应商</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">备注</label>
              <Input placeholder="采购备注" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">采购商品</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />添加行
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 border rounded-lg p-3">
                <div className="flex-1">
                  <Input
                    placeholder="商品名称"
                    value={item.spuName}
                    onChange={(e) => updateItem(idx, "spuName", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="w-28">
                  <Input
                    placeholder="规格"
                    value={item.skuSpec}
                    onChange={(e) => updateItem(idx, "skuSpec", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min={1}
                    placeholder="数量"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-9"
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="单价(元)"
                    value={item.price ? (item.price / 100).toFixed(2) : ""}
                    onChange={(e) => {
                      const yuan = parseFloat(e.target.value) || 0
                      updateItem(idx, "price", Math.round(yuan * 100))
                    }}
                    className="h-9"
                  />
                </div>
                <div className="w-24 text-sm text-right">
                  ¥{(item.price * item.quantity / 100).toFixed(2)}
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive"
                  onClick={() => removeItem(idx)} disabled={items.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4 text-lg font-bold">
            合计：¥{(totalAmount / 100).toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
          取消
        </Button>
        <Button variant="secondary" onClick={() => handleSubmit(0)} disabled={submitting}>
          <Save className="h-4 w-4 mr-2" />保存草稿
        </Button>
        <Button onClick={() => handleSubmit(1)} disabled={submitting}>
          <Send className="h-4 w-4 mr-2" />提交审核
        </Button>
      </div>
    </div>
  )
}
