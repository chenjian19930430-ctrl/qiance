"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type DataTableProps } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface ReconRow {
  id: string
  period: string
  platform: string
  orderCount: number
  platformAmount: number
  actualAmount: number
  diff: number
  status: "matched" | "mismatch" | "pending"
}

const fakeData: ReconRow[] = [
  { id: "1", period: "2026-05-27", platform: "抖音", orderCount: 142, platformAmount: 85600, actualAmount: 85600, diff: 0, status: "matched" },
  { id: "2", period: "2026-05-27", platform: "快手", orderCount: 78, platformAmount: 42300, actualAmount: 41800, diff: -500, status: "mismatch" },
  { id: "3", period: "2026-05-27", platform: "视频号", orderCount: 35, platformAmount: 21500, actualAmount: 21500, diff: 0, status: "matched" },
  { id: "4", period: "2026-05-27", platform: "淘宝", orderCount: 22, platformAmount: 12800, actualAmount: 12800, diff: 0, status: "matched" },
  { id: "5", period: "2026-05-26", platform: "抖音", orderCount: 131, platformAmount: 79200, actualAmount: 79200, diff: 0, status: "matched" },
  { id: "6", period: "2026-05-26", platform: "快手", orderCount: 65, platformAmount: 38700, actualAmount: 38200, diff: -500, status: "pending" },
  { id: "7", period: "2026-05-26", platform: "视频号", orderCount: 30, platformAmount: 18900, actualAmount: 18900, diff: 0, status: "matched" },
]

const columns: ColumnDef<ReconRow>[] = [
  { header: "对账日期", accessorKey: "period" },
  { header: "平台", accessorKey: "platform" },
  { header: "订单数", accessorKey: "orderCount" },
  { header: "平台金额", accessorKey: "platformAmount", cell: ({ row }) => `¥${row.original.platformAmount.toLocaleString()}` },
  { header: "实际金额", accessorKey: "actualAmount", cell: ({ row }) => `¥${row.original.actualAmount.toLocaleString()}` },
  {
    header: "差额", accessorKey: "diff",
    cell: ({ row }) => {
      const d = row.original.diff
      return <span className={d === 0 ? "text-green-500" : "text-red-500"}>{d === 0 ? "¥0" : `¥${d.toLocaleString()}`}</span>
    },
  },
  {
    header: "状态", accessorKey: "status",
    cell: ({ row }) => {
      const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
        matched: { icon: <CheckCircle2 className="h-3 w-3" />, label: "已对平", cls: "text-green-500" },
        mismatch: { icon: <AlertCircle className="h-3 w-3" />, label: "差异", cls: "text-red-500" },
        pending: { icon: <Clock className="h-3 w-3" />, label: "待确认", cls: "text-yellow-500" },
      }
      const s = map[row.original.status]
      return <span className={`inline-flex items-center gap-1 ${s.cls}`}>{s.icon}{s.label}</span>
    },
  },
]

export default function ReconciliationPage() {
  const matched = fakeData.filter(r => r.status === "matched").length
  const mismatch = fakeData.filter(r => r.status === "mismatch").length
  const pending = fakeData.filter(r => r.status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">对账管理</h2><p className="text-sm text-muted-foreground mt-1">平台收款对账</p></div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />导出对账单</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />已对平</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">{matched}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" />有差异</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-500">{mismatch}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-500" />待确认</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-500">{pending}</p></CardContent></Card>
      </div>

      <DataTable columns={columns} data={fakeData} total={fakeData.length}
        page={1} pageSize={50} onPageChange={() => {}} onPageSizeChange={() => {}} searchable={true} searchPlaceholder="搜索平台/日期..." />
    </div>
  )
}
