"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Spu extends Record<string, unknown> {
  id: string
  name: string
  code: string
  brand: string
  description?: string
  category?: { name: string; id: string }
  shop?: { name: string }
  company?: { name: string }
  status: number
  salePrice: number
  costPrice: number
  createdAt: string
  skus?: { length: number }
}

const columns: ColumnDef<Spu>[] = [
  { accessorKey: "name", header: "商品名称" },
  { accessorKey: "code", header: "商品编码" },
  { accessorKey: "brand", header: "品牌" },
  {
    accessorKey: "category",
    header: "分类",
    cell: ({ row }) => row.original.category?.name || "-",
  },
  {
    accessorKey: "salePrice",
    header: "售价",
    cell: ({ row }) => `¥${(row.original.salePrice / 100).toFixed(2)}`,
  },
  {
    accessorKey: "costPrice",
    header: "成本价",
    cell: ({ row }) => `¥${(row.original.costPrice / 100).toFixed(2)}`,
  },
  {
    accessorKey: "skus",
    header: "SKU数",
    cell: ({ row }) => row.original.skus?.length || 0,
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => (
      <span>{row.original.status === 0 ? "上架" : "下架"}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("zh-CN"),
  },
]

const fields = [
  { name: "name", label: "商品名称", type: "text" as const, required: true },
  { name: "code", label: "商品编码", type: "text" as const, required: true },
  { name: "brand", label: "品牌", type: "text" as const },
  { name: "description", label: "商品描述", type: "text" as const },
  { name: "salePrice", label: "售价(元)", type: "number" as const, placeholder: "输入售价（元），自动转换为分存储" },
  { name: "costPrice", label: "成本价(元)", type: "number" as const, placeholder: "输入成本价（元），自动转换为分存储" },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "上架", value: 0 },
    { label: "下架", value: 1 },
  ]},
]

export default function SpuPage() {
  return (
    <CrudPage<Spu>
      title="SPU管理"
      description="管理商品SPU信息，每个SPU可包含多个SKU规格"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/goods/spu", params)}
      onCreate={async (values) => api.post("/api/goods/spu", {
        ...values,
        salePrice: Math.round(Number(values.salePrice || 0) * 100),
        costPrice: Math.round(Number(values.costPrice || 0) * 100),
      })}
      onUpdate={async (id, values) => api.put(`/api/goods/spu?id=${id}`, {
        ...values,
        salePrice: Math.round(Number(values.salePrice || 0) * 100),
        costPrice: Math.round(Number(values.costPrice || 0) * 100),
      })}
      onDelete={async (id) => api.delete(`/api/goods/spu?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索商品名称..."
      getEditValues={(row) => ({
        ...row,
        salePrice: row.salePrice / 100,
        costPrice: row.costPrice / 100,
      })}
    />
  )
}
