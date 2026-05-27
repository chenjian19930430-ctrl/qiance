"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { api } from "@/lib/api"

interface InventoryItem {
  id: string
  skuName: string
  skuCode: string
  skuSpec: string
  warehouse: string
  warehouseId: string
  total: number
  locked: number
  available: number
  threshold: number
  unit: string
  status: "normal" | "low" | "out"
}

interface Warehouse {
  id: string
  name: string
  code: string
}

export default function InventoryOverviewPage() {
  const [data, setData] = useState<InventoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [search, setSearch] = useState("")
  const [warehouseId, setWarehouseId] = useState("")
  const [alertOnly, setAlertOnly] = useState(false)
  const [loading, setLoading] = useState(false)

  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [inboundForm, setInboundForm] = useState({
    spuName: "",
    skuCode: "",
    quantity: 0,
    warehouseId: "",
    unit: "个",
    threshold: 10,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, pageSize }
      if (search) params.search = search
      if (warehouseId) params.warehouseId = warehouseId
      if (alertOnly) params.alert = "1"
      const result = await api.get<{ list: InventoryItem[]; total: number }>("/api/inventory", params)
      setData(result.list)
      setTotal(result.total)
    } catch (error: any) {
      toast.error("加载库存数据失败")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, warehouseId, alertOnly])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    api.get<{ list: Warehouse[]; total: number }>("/api/warehouse", { page: 1, pageSize: 100 })
      .then((res) => setWarehouses(res.list))
      .catch(() => {})
  }, [])

  const lowStock = data.filter(i => i.status === "low" || i.status === "out").length
  const totalItems = data.reduce((s, i) => s + i.total, 0)

  const handleInbound = async () => {
    if (!inboundForm.spuName || inboundForm.quantity <= 0) {
      toast.error("请填写商品名称和入库数量")
      return
    }
    try {
      await api.post("/api/inventory", inboundForm)
      toast.success("入库登记成功")
      setFormOpen(false)
      setInboundForm({ spuName: "", skuCode: "", quantity: 0, warehouseId: "", unit: "个", threshold: 10 })
      loadData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const columns: ColumnDef<InventoryItem>[] = [
    { header: "SKU名称", accessorKey: "skuName" },
    { header: "SKU编码", accessorKey: "skuCode" },
    { header: "规格", accessorKey: "skuSpec" },
    { header: "仓库", accessorKey: "warehouse" },
    { header: "总库存", accessorKey: "total" },
    { header: "已锁", accessorKey: "locked" },
    { header: "可用", accessorKey: "available" },
    { header: "预警线", accessorKey: "threshold" },
    {
      header: "状态", accessorKey: "status",
      cell: ({ row }) => {
        const m: Record<string, { label: string; cls: string }> = {
          normal: { label: "正常", cls: "text-green-600 bg-green-50 dark:bg-green-950" },
          low: { label: "偏低", cls: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
          out: { label: "缺货", cls: "text-red-600 bg-red-50 dark:bg-red-950" },
        }
        const s = m[row.original.status]
        return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>
      },
    },
    { header: "单位", accessorKey: "unit" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">库存概览</h2><p className="text-sm text-muted-foreground mt-1">全仓库存状态与预警</p></div>
        <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-1" />入库登记</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" />总库存量</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalItems.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">SKU种类</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" />预警/缺货</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-500">{lowStock}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">可用库存占比</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">
            {totalItems > 0 ? ((data.reduce((s, i) => s + i.available, 0) / totalItems) * 100).toFixed(1) + "%" : "-"}
          </p></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm">
          <Input placeholder="搜索SKU名称/编码..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-3 h-9 w-[250px]" />
        </div>
        <select className="border rounded px-3 py-1.5 text-sm bg-background h-9"
          value={warehouseId} onChange={(e) => { setWarehouseId(e.target.value); setPage(1) }}>
          <option value="">全部仓库</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={alertOnly}
            onChange={(e) => { setAlertOnly(e.target.checked); setPage(1) }} />
          仅显示预警
        </label>
      </div>

      <DataTable columns={columns} data={data} total={total}
        page={page} pageSize={pageSize} onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        loading={loading} emptyText="暂无库存数据" />

      {/* 入库登记弹窗 */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>入库登记</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">商品名称</label>
              <Input placeholder="商品名称" value={inboundForm.spuName}
                onChange={(e) => setInboundForm({ ...inboundForm, spuName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SKU编码</label>
              <Input placeholder="SKU编码（可选）" value={inboundForm.skuCode}
                onChange={(e) => setInboundForm({ ...inboundForm, skuCode: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">入库数量</label>
                <Input type="number" min={1} value={inboundForm.quantity || ""}
                  onChange={(e) => setInboundForm({ ...inboundForm, quantity: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">仓库</label>
                <select className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={inboundForm.warehouseId}
                  onChange={(e) => setInboundForm({ ...inboundForm, warehouseId: e.target.value })}>
                  <option value="">选择仓库</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">单位</label>
                <select className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={inboundForm.unit}
                  onChange={(e) => setInboundForm({ ...inboundForm, unit: e.target.value })}>
                  <option value="个">个</option><option value="件">件</option><option value="双">双</option><option value="盒">盒</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">预警阈值</label>
                <Input type="number" min={1} value={inboundForm.threshold}
                  onChange={(e) => setInboundForm({ ...inboundForm, threshold: parseInt(e.target.value) || 10 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>取消</Button>
            <Button onClick={handleInbound}>确认入库</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
