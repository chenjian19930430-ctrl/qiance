"use client"

import { useState, useCallback } from "react"
import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

interface Order extends Record<string, unknown> {
  id: string
  orderNo: string
  channel: string | null
  orderTime: string
  totalAmount: number | string
  discountAmount: number | string
  realAmount: number | string
  buyerName: string | null
  buyerPhone: string | null
  buyerAddress: string | null
  orderStatus: number
  type: number
  createdAt: string
}

const orderStatusMap: Record<number, string> = {
  0: "待发货",
  1: "已发货",
  2: "已完成",
  3: "已取消",
  4: "售后中",
}

const statusColorMap: Record<number, string> = {
  0: "text-yellow-600",
  1: "text-blue-600",
  2: "text-green-600",
  3: "text-gray-500",
  4: "text-red-600",
}

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNo",
    header: "订单号",
    cell: ({ row }) => (
      <span className="text-primary cursor-pointer hover:underline font-medium">
        {row.original.orderNo}
      </span>
    ),
  },
  {
    accessorKey: "channel",
    header: "渠道",
    cell: ({ row }) => row.original.channel || "-",
  },
  {
    accessorKey: "orderTime",
    header: "下单时间",
    cell: ({ row }) => row.original.orderTime
      ? new Date(row.original.orderTime).toLocaleString("zh-CN")
      : "-",
  },
  {
    accessorKey: "totalAmount",
    header: "商品金额",
    cell: ({ row }) => `¥${Number(row.original.totalAmount || 0).toFixed(2)}`,
  },
  {
    accessorKey: "realAmount",
    header: "实付金额",
    cell: ({ row }) => `¥${Number(row.original.realAmount || 0).toFixed(2)}`,
  },
  {
    accessorKey: "buyerName",
    header: "买家",
    cell: ({ row }) => row.original.buyerName || "-",
  },
  {
    accessorKey: "orderStatus",
    header: "状态",
    cell: ({ row }) => (
      <span className={`font-medium ${statusColorMap[row.original.orderStatus] || ""}`}>
        {orderStatusMap[row.original.orderStatus] || "未知"}
      </span>
    ),
  },
]

const fields = [
  { name: "remark", label: "买家备注", type: "textarea" as const },
  { name: "buyerName", label: "收货人", type: "text" as const },
  { name: "buyerPhone", label: "联系电话", type: "phone" as const },
  { name: "buyerAddress", label: "收货地址", type: "textarea" as const },
  { name: "orderStatus", label: "订单状态", type: "select" as const, options: [
    { label: "待发货", value: 0 },
    { label: "已发货", value: 1 },
    { label: "已完成", value: 2 },
    { label: "已取消", value: 3 },
    { label: "售后中", value: 4 },
  ]},
]

export default function OrderListPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchText, setSearchText] = useState("")
  const [filterKey, setFilterKey] = useState(0)

  const fetchData = useCallback(async (params: { page: number; pageSize: number; search?: string }) => {
    return api.get<{ list: Order[]; total: number }>("/api/order", {
      ...params,
      type: 0,
      orderNo: params.search || undefined,
      orderStatus: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }, [statusFilter, startDate, endDate])

  return (
    <div className="space-y-4">
      {/* 筛选工具栏 */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">状态：</label>
            <select
              className="border rounded px-3 py-1.5 text-sm bg-background h-9"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部</option>
              <option value="0">待发货</option>
              <option value="1">已发货</option>
              <option value="2">已完成</option>
              <option value="3">已取消</option>
              <option value="4">售后中</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">日期：</label>
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
            <Button
              size="sm"
              onClick={() => setFilterKey(k => k + 1)}
            >
              <Search className="h-4 w-4 mr-1" />查询
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatusFilter("")
                setStartDate("")
                setEndDate("")
                setSearchText("")
                setFilterKey(k => k + 1)
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1" />重置
            </Button>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <CrudPage<Order>
        key={filterKey}
        title="原始订单"
        description="管理所有平台原始订单"
        columns={columns}
        fields={fields}
        fetchData={fetchData}
        onUpdate={async (id, values) => api.put(`/api/order?id=${id}`, values)}
        getId={(row) => row.id}
        searchable
        searchPlaceholder="搜索订单号..."
        creatable={false}
        deletable={false}
        onRowClick={(row) => router.push(`/order/list/${row.id}`)}
        renderActions={(row) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/order/list/${row.id}`)
            }}
          >
            <Eye className="h-3 w-3 mr-1" />明细
          </Button>
        )}
      />
    </div>
  )
}
