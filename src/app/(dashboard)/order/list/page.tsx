"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Order extends Record<string, unknown> {
  id: string
  orderNo: string
  shopId: string
  shop?: { name: string }
  orderTime: string
  itemAmount: number
  discount: number
  realAmount: number
  buyerNick: string
  buyerMessage: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  status: number
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

const columns: ColumnDef<Order>[] = [
  { accessorKey: "orderNo", header: "订单号" },
  {
    accessorKey: "shop",
    header: "店铺",
    cell: ({ row }) => row.original.shop?.name || "-",
  },
  {
    accessorKey: "orderTime",
    header: "下单时间",
    cell: ({ row }) => new Date(row.original.orderTime).toLocaleString("zh-CN"),
  },
  {
    accessorKey: "itemAmount",
    header: "商品金额",
    cell: ({ row }) => `¥${(row.original.itemAmount / 100).toFixed(2)}`,
  },
  {
    accessorKey: "realAmount",
    header: "实付金额",
    cell: ({ row }) => `¥${(row.original.realAmount / 100).toFixed(2)}`,
  },
  { accessorKey: "buyerNick", header: "买家" },
  { accessorKey: "receiverName", header: "收货人" },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => orderStatusMap[row.original.status] || "未知",
  },
]

const fields = [
  { name: "buyerMessage", label: "买家留言", type: "textarea" as const },
  { name: "receiverName", label: "收货人", type: "text" as const },
  { name: "receiverPhone", label: "联系电话", type: "phone" as const },
  { name: "receiverAddress", label: "收货地址", type: "textarea" as const },
  { name: "status", label: "订单状态", type: "select" as const, options: [
    { label: "待发货", value: 0 },
    { label: "已发货", value: 1 },
    { label: "已完成", value: 2 },
    { label: "已取消", value: 3 },
    { label: "售后中", value: 4 },
  ]},
]

export default function OrderListPage() {
  return (
    <CrudPage<Order>
      title="原始订单"
      description="管理所有平台原始订单"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/order", { ...params, type: 0 })}
      onUpdate={async (id, values) => api.put(`/api/order?id=${id}`, values)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索订单号..."
      creatable={false}
      deletable={false}
    />
  )
}
