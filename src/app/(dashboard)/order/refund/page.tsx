"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface RefundRow {
  id: string
  orderId: string
  platform: string
  amount: number
  reason: string
  status: "pending" | "approved" | "rejected"
  created: string
}

const fakeData: RefundRow[] = [
  { id: "1", orderId: "ORD-20260527-001", platform: "抖音", amount: 299, reason: "商品与描述不符", status: "pending", created: "2026-05-27 10:30" },
  { id: "2", orderId: "ORD-20260527-002", platform: "快手", amount: 159, reason: "物流太慢取消订单", status: "pending", created: "2026-05-27 09:15" },
  { id: "3", orderId: "ORD-20260526-015", platform: "抖音", amount: 599, reason: "质量问题", status: "approved", created: "2026-05-26 14:00" },
  { id: "4", orderId: "ORD-20260526-008", platform: "视频号", amount: 89, reason: "发错货", status: "approved", created: "2026-05-26 11:20" },
  { id: "5", orderId: "ORD-20260525-032", platform: "抖音", amount: 1280, reason: "七天无理由退货", status: "rejected", created: "2026-05-25 16:45" },
  { id: "6", orderId: "ORD-20260525-021", platform: "快手", amount: 45, reason: "不想要了", status: "pending", created: "2026-05-25 08:30" },
]

const columns: ColumnDef<RefundRow>[] = [
  { header: "售后单号", accessorKey: "id" },
  { header: "原订单", accessorKey: "orderId" },
  { header: "平台", accessorKey: "platform" },
  { header: "退款金额", accessorKey: "amount", cell: ({ row }) => `¥${row.original.amount}` },
  { header: "退款原因", accessorKey: "reason" },
  {
    header: "状态", accessorKey: "status",
    cell: ({ row }) => {
      const m: Record<string, { label: string; cls: string }> = {
        pending: { label: "待处理", cls: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
        approved: { label: "已退款", cls: "text-green-600 bg-green-50 dark:bg-green-950" },
        rejected: { label: "已拒绝", cls: "text-red-600 bg-red-50 dark:bg-red-950" },
      }
      const s = m[row.original.status]
      return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>
    },
  },
  { header: "申请时间", accessorKey: "created" },
]

export default function RefundPage() {
  const pending = fakeData.filter(r => r.status === "pending").length
  const totalAmount = fakeData.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">售后订单</h2><p className="text-sm text-muted-foreground mt-1">退款/售后处理</p></div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">待处理</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{pending}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">售后总额</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">¥{totalAmount}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">退款率</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">3.2%</p></CardContent></Card>
      </div>

      <DataTable columns={columns} data={fakeData} total={fakeData.length}
        page={1} pageSize={50} onPageChange={() => {}} onPageSizeChange={() => {}} searchable={true} searchPlaceholder="搜索订单号..." />
    </div>
  )
}
