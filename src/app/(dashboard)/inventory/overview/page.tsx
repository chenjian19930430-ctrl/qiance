"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { CrudForm, type FieldConfig } from "@/components/ui/crud-form"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, Package } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

interface InventoryItem {
  id: string
  skuName: string
  skuCode: string
  category: string
  warehouse: string
  total: number
  reserved: number
  available: number
  threshold: number
  unit: string
  status: "normal" | "low" | "out"
}

const fakeData: InventoryItem[] = [
  { id: "1", skuName: "纯棉T恤-白色-M", skuCode: "TS-WH-M-001", category: "服装", warehouse: "主仓", total: 1280, reserved: 35, available: 1245, threshold: 100, unit: "件", status: "normal" },
  { id: "2", skuName: "运动鞋-黑色-42", skuCode: "SN-BK-42-002", category: "鞋类", warehouse: "主仓", total: 560, reserved: 28, available: 532, threshold: 50, unit: "双", status: "normal" },
  { id: "3", skuName: "无线耳机-Pro", skuCode: "EP-PRO-003", category: "数码", warehouse: "主仓", total: 45, reserved: 12, available: 33, threshold: 30, unit: "个", status: "low" },
  { id: "4", skuName: "手机壳-透明", skuCode: "PC-CLR-004", category: "配件", warehouse: "主仓", total: 3200, reserved: 88, available: 3112, threshold: 200, unit: "个", status: "normal" },
  { id: "5", skuName: "保温杯-500ml", skuCode: "BC-500-005", category: "日用品", warehouse: "主仓", total: 0, reserved: 0, available: 0, threshold: 50, unit: "个", status: "out" },
  { id: "6", skuName: "书包-蓝色", skuCode: "BG-BL-006", category: "箱包", warehouse: "华北仓", total: 185, reserved: 5, available: 180, threshold: 30, unit: "个", status: "normal" },
  { id: "7", skuName: "零食礼盒-端午", skuCode: "SN-DW-007", category: "食品", warehouse: "主仓", total: 8, reserved: 3, available: 5, threshold: 20, unit: "盒", status: "low" },
]

const fields: FieldConfig[] = [
  { name: "skuName", label: "SKU名称", type: "text", required: true, placeholder: "请输入SKU名称" },
  { name: "skuCode", label: "SKU编码", type: "text", required: true, placeholder: "自动生成或手动输入" },
  { name: "category", label: "类别", type: "select", required: true, options: [
    { label: "服装", value: "服装" }, { label: "鞋类", value: "鞋类" }, { label: "数码", value: "数码" },
    { label: "配件", value: "配件" }, { label: "日用品", value: "日用品" }, { label: "箱包", value: "箱包" }, { label: "食品", value: "食品" },
  ]},
  { name: "warehouse", label: "仓库", type: "select", required: true, options: [
    { label: "主仓", value: "主仓" }, { label: "华北仓", value: "华北仓" }, { label: "华南仓", value: "华南仓" },
  ]},
  { name: "total", label: "总库存", type: "number", required: true },
  { name: "threshold", label: "预警阈值", type: "number", required: true, defaultValue: 50 },
  { name: "unit", label: "单位", type: "select", required: true, options: [
    { label: "件", value: "件" }, { label: "双", value: "双" }, { label: "个", value: "个" }, { label: "盒", value: "盒" },
  ]},
]

const columns: ColumnDef<InventoryItem>[] = [
  { header: "SKU名称", accessorKey: "skuName" },
  { header: "SKU编码", accessorKey: "skuCode" },
  { header: "类别", accessorKey: "category" },
  { header: "仓库", accessorKey: "warehouse" },
  { header: "总库存", accessorKey: "total" },
  { header: "已占", accessorKey: "reserved" },
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

export default function InventoryOverviewPage() {
  const [formOpen, setFormOpen] = useState(false)

  const lowStock = fakeData.filter(i => i.status === "low" || i.status === "out").length
  const totalItems = fakeData.reduce((s, i) => s + i.total, 0)

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
          <CardContent><p className="text-2xl font-bold">{fakeData.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" />预警/缺货</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-500">{lowStock}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">可用库存占比</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{((fakeData.reduce((s, i) => s + i.available, 0) / totalItems) * 100).toFixed(1)}%</p></CardContent></Card>
      </div>

      <DataTable columns={columns} data={fakeData} total={fakeData.length}
        page={1} pageSize={50} onPageChange={() => {}} onPageSizeChange={() => {}} searchable={true} searchPlaceholder="搜索SKU名称/编码..." />

      <CrudForm open={formOpen} onOpenChange={setFormOpen} title="入库登记" fields={fields} onSubmit={async (v) => {
        toast.success(`入库登记成功`)
        setFormOpen(false)
      }} />
    </div>
  )
}
