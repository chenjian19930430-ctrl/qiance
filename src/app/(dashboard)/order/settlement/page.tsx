"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle2, AlertCircle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface SettlementRow {
  id: string
  batchNo: string
  period: string
  platform: string
  orderCount: number
  totalAmount: number
  commission: number
  netAmount: number
  status: "settled" | "pending" | "failed"
}

const fakeData: SettlementRow[] = [
  { id: "1", batchNo: "SET-20260527-001", period: "05/21-05/27", platform: "抖音", orderCount: 142, totalAmount: 85600, commission: 4280, netAmount: 81320, status: "settled" },
  { id: "2", batchNo: "SET-20260527-002", period: "05/21-05/27", platform: "快手", orderCount: 78, totalAmount: 42300, commission: 2115, netAmount: 40185, status: "pending" },
  { id: "3", batchNo: "SET-20260527-003", period: "05/21-05/27", platform: "视频号", orderCount: 35, totalAmount: 21500, commission: 1075, netAmount: 20425, status: "settled" },
  { id: "4", batchNo: "SET-20260527-004", period: "05/21-05/27", platform: "淘宝", orderCount: 22, totalAmount: 12800, commission: 640, netAmount: 12160, status: "pending" },
  { id: "5", batchNo: "SET-20260520-001", period: "05/14-05/20", platform: "抖音", orderCount: 131, totalAmount: 79200, commission: 3960, netAmount: 75240, status: "settled" },
  { id: "6", batchNo: "SET-20260520-002", period: "05/14-05/20", platform: "快手", orderCount: 65, totalAmount: 38700, commission: 1935, netAmount: 36765, status: "settled" },
  { id: "7", batchNo: "SET-20260520-003", period: "05/14-05/20", platform: "视频号", orderCount: 30, totalAmount: 18900, commission: 945, netAmount: 17955, status: "failed" },
]

const columns: ColumnDef<SettlementRow>[] = [
  { header: "结算批次", accessorKey: "batchNo" },
  { header: "结算周期", accessorKey: "period" },
  { header: "平台", accessorKey: "platform" },
  { header: "订单数", accessorKey: "orderCount" },
  { header: "总金额", accessorKey: "totalAmount", cell: ({ row }) => `¥${row.original.totalAmount.toLocaleString()}` },
  { header: "佣金", accessorKey: "commission", cell: ({ row }) => `¥${row.original.commission.toLocaleString()}` },
  { header: "净结算", accessorKey: "netAmount", cell: ({ row }) => `¥${row.original.netAmount.toLocaleString()}` },
  {
    header: "状态", accessorKey: "status",
    cell: ({ row }) => {
      const m: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
        settled: { label: "已结算", icon: <CheckCircle2 className="h-3 w-3" />, cls: "text-green-500" },
        pending: { label: "待结算", icon: <AlertCircle className="h-3 w-3" />, cls: "text-yellow-500" },
        failed: { label: "结算失败", icon: <AlertCircle className="h-3 w-3" />, cls: "text-red-500" },
      }
      const s = m[row.original.status]
      return <span className={`inline-flex items-center gap-1 ${s.cls}`}>{s.icon}{s.label}</span>
    },
  },
]

export default function SettlementPage() {
  const settled = fakeData.filter(r => r.status === "settled")
  const settledAmount = settled.reduce((s, r) => s + r.netAmount, 0)
  const pendingAmt = fakeData.filter(r => r.status === "pending").reduce((s, r) => s + r.netAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">结算订单</h2><p className="text-sm text-muted-foreground mt-1">平台结算批次管理与查询</p></div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />导出结算单</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">已结算金额</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">¥{(settledAmount / 10000).toFixed(1)}万</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">待结算金额</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-500">¥{(pendingAmt / 10000).toFixed(1)}万</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">结算批次</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{fakeData.length}</p></CardContent></Card>
      </div>

      <DataTable columns={columns} data={fakeData} total={fakeData.length}
        page={1} pageSize={50} onPageChange={() => {}} onPageSizeChange={() => {}} searchable={true} searchPlaceholder="搜索批次号/平台..." />
    </div>
  )
}
