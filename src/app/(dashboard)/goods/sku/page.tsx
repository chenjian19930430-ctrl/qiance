"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Sku extends Record<string, unknown> {
  id: string
  name: string
  code: string
  spu?: { name: string }
  shop?: { name: string }
  salePrice: number
  costPrice: number
  stock: number
  status: number
  specs: string
  createdAt: string
}

const columns: ColumnDef<Sku>[] = [
  { accessorKey: "name", header: "SKU名称" },
  { accessorKey: "code", header: "SKU编码" },
  {
    accessorKey: "spu",
    header: "所属SPU",
    cell: ({ row }) => row.original.spu?.name || "-",
  },
  {
    accessorKey: "shop",
    header: "店铺",
    cell: ({ row }) => row.original.shop?.name || "-",
  },
  {
    accessorKey: "salePrice",
    header: "售价",
    cell: ({ row }) => `¥${(row.original.salePrice / 100).toFixed(2)}`,
  },
  { accessorKey: "stock", header: "库存" },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => (
      <span>{row.original.status === 0 ? "正常" : "禁用"}</span>
    ),
  },
]

const fields = [
  { name: "name", label: "SKU名称", type: "text" as const, required: true },
  { name: "code", label: "SKU编码", type: "text" as const, required: true },
  { name: "salePrice", label: "售价(分)", type: "number" as const, placeholder: "单位：分" },
  { name: "costPrice", label: "成本价(分)", type: "number" as const, placeholder: "单位：分" },
  { name: "stock", label: "库存", type: "number" as const },
  { name: "specs", label: "规格", type: "text" as const, placeholder: "如：颜色:红色,尺寸:L" },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function SkuPage() {
  return (
    <CrudPage<Sku>
      title="SKU管理"
      description="管理SKU规格与价格信息"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/goods/sku", params)}
      onCreate={async (values) => api.post("/api/goods/sku", values)}
      onUpdate={async (id, values) => api.put(`/api/goods/sku?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/goods/sku?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索SKU名称..."
    />
  )
}
