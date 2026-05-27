"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Search, RotateCcw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

interface RefundRow {
  id: string
  orderNo: string
  channel: string | null
  buyerName: string | null
  totalAmount: number | string
  realAmount: number | string
  orderStatus: number
  orderTime: string | null
  remark: string | null
  reason: string
}

const refundStatusMap: Record<number, { label: string; icon: React.ReactNode; cls: string }> = {
  0: { label: "待处理", icon: <AlertTriangle className="h-3 w-3" />, cls: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
  1: { label: "已退款", icon: <CheckCircle2 className="h-3 w-3" />, cls: "text-green-600 bg-green-50 dark:bg-green-950" },
  2: { label: "已拒绝", icon: <XCircle className="h-3 w-3" />, cls: "text-red-600 bg-red-50 dark:bg-red-950" },
}

const columns: ColumnDef<RefundRow>[] = [
  { header: "订单号", accessorKey: "orderNo" },
  { header: "平台", accessorKey: "channel", cell: ({ row }) => row.original.channel || "-" },
  {
    header: "订单金额",
    accessorKey: "totalAmount",
    cell: ({ row }) => `¥${Number(row.original.totalAmount || 0).toFixed(2)}`,
  },
  {
    header: "实付金额",
    accessorKey: "realAmount",
    cell: ({ row }) => `¥${Number(row.original.realAmount || 0).toFixed(2)}`,
  },
  { header: "买家", accessorKey: "buyerName", cell: ({ row }) => row.original.buyerName || "-" },
  {
    header: "退款原因",
    accessorKey: "remark",
    cell: ({ row }) => row.original.remark || "买家未留言",
    meta: { maxWidth: 200 },
  },
  {
    header: "状态",
    accessorKey: "orderStatus",
    cell: ({ row }) => {
      const status = row.original.orderStatus
      // 4 = 售后中（待处理），2 = 已完成（已退款），3 = 已取消（已拒绝）
      const map: Record<number, { label: string; icon: React.ReactNode; cls: string }> = {
        4: { label: "售后中", icon: <AlertTriangle className="h-3 w-3" />, cls: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
        2: { label: "已退款", icon: <CheckCircle2 className="h-3 w-3" />, cls: "text-green-600 bg-green-50 dark:bg-green-950" },
        3: { label: "已取消", icon: <XCircle className="h-3 w-3" />, cls: "text-red-600 bg-red-50 dark:bg-red-950" },
      }
      const s = map[status] || { label: "未知", icon: null, cls: "text-gray-600 bg-gray-50" }
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>
          {s.icon}{s.label}
        </span>
      )
    },
  },
  {
    header: "下单时间",
    accessorKey: "orderTime",
    cell: ({ row }) => row.original.orderTime ? new Date(row.original.orderTime).toLocaleString("zh-CN") : "-",
  },
]

export default function RefundPage() {
  const [data, setData] = useState<RefundRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filterKey, setFilterKey] = useState(0)

  const loadData = async () => {
    setLoading(true)
    try {
      const orderStatusCondition = statusFilter || "4" // 默认查售后中
      const result = await api.get<{ list: RefundRow[]; total: number }>("/api/order", {
        type: 0,
        page: 1,
        pageSize: 100,
        orderStatus: orderStatusCondition,
        orderNo: searchText || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setData(result.list || [])
      setTotal(result.total || 0)
    } catch (e) {
      toast.error("加载售后数据失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filterKey])

  const pending = data.filter(r => r.orderStatus === 4).length
  const totalAmount = data.reduce((s, r) => s + Number(r.realAmount || 0), 0)
  const refundRate = total > 0 ? ((pending / total) * 100).toFixed(1) : "0.0"

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">售后订单</h2><p className="text-sm text-muted-foreground mt-1">退款/售后处理</p></div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">售后总额</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">¥{totalAmount.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">售后率</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{refundRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">售后订单</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选栏 */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">状态：</label>
            <select
              className="border rounded px-3 py-1.5 text-sm bg-background h-9"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部售后</option>
              <option value="4">售后中</option>
              <option value="2">已完成（已退款）</option>
              <option value="3">已取消</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">日期：</label>
            <input
              type="date"
              className="border rounded px-3 py-1.5 text-sm bg-background h-9"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-muted-foreground">~</span>
            <input
              type="date"
              className="border rounded px-3 py-1.5 text-sm bg-background h-9"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索订单号..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 h-9 w-[200px]"
                onKeyDown={(e) => { if (e.key === "Enter") setFilterKey(k => k + 1) }}
              />
            </div>
            <Button size="sm" onClick={() => setFilterKey(k => k + 1)}>
              <Search className="h-4 w-4 mr-1" />查询
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setStatusFilter("")
              setStartDate("")
              setEndDate("")
              setSearchText("")
              setFilterKey(k => k + 1)
            }}>
              <RotateCcw className="h-4 w-4 mr-1" />重置
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={1}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        searchable={false}
        loading={loading}
      />
    </div>
  )
}
