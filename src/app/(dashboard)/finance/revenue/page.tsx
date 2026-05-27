"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface RevenueRow {
  id: string
  date: string
  channel: string
  amount: number
  orders: number
  growth: number
}

const fakeData: RevenueRow[] = [
  { id: "1", date: "2026-05-27", channel: "抖音", amount: 85600, orders: 142, growth: 12.3 },
  { id: "2", date: "2026-05-27", channel: "快手", amount: 42300, orders: 78, growth: -3.2 },
  { id: "3", date: "2026-05-27", channel: "视频号", amount: 21500, orders: 35, growth: 28.7 },
  { id: "4", date: "2026-05-27", channel: "淘宝", amount: 12800, orders: 22, growth: 5.1 },
  { id: "5", date: "2026-05-26", channel: "抖音", amount: 79200, orders: 131, growth: 8.9 },
  { id: "6", date: "2026-05-26", channel: "快手", amount: 38700, orders: 65, growth: -1.5 },
  { id: "7", date: "2026-05-26", channel: "视频号", amount: 18900, orders: 30, growth: 15.2 },
  { id: "8", date: "2026-05-26", channel: "淘宝", amount: 11500, orders: 19, growth: 2.3 },
]

const columns: ColumnDef<RevenueRow>[] = [
  { header: "日期", accessorKey: "date" },
  { header: "渠道", accessorKey: "channel" },
  { header: "金额(元)", accessorKey: "amount", cell: ({ row }) => `¥${row.original.amount.toLocaleString()}` },
  { header: "订单数", accessorKey: "orders" },
  {
    header: "环比", accessorKey: "growth",
    cell: ({ row }) => (
      <span className={`inline-flex items-center gap-1 ${row.original.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
        {row.original.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {row.original.growth.toFixed(1)}%
      </span>
    ),
  },
]

export default function RevenuePage() {
  const [period] = useState<"daily" | "weekly" | "monthly">("daily")

  const totalRevenue = fakeData.reduce((s, r) => s + r.amount, 0)
  const totalOrders = fakeData.reduce((s, r) => s + r.orders, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">营收分析</h2><p className="text-sm text-muted-foreground mt-1">各渠道营收数据明细</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />导出</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">总营收</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">¥{(totalRevenue / 10000).toFixed(1)}万</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">总订单数</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalOrders}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">平均客单价</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">¥{(totalRevenue / totalOrders).toFixed(0)}</p></CardContent></Card>
      </div>

      <DataTable columns={columns} data={fakeData} total={fakeData.length} page={1} pageSize={50}
        onPageChange={() => {}} onPageSizeChange={() => {}} searchable={false} />
    </div>
  )
}
