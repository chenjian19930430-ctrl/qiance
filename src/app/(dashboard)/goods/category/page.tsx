"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Category extends Record<string, unknown> {
  id: string
  name: string
  parentId: string
  sort: number
  status: number
  createdAt: string
}

const columns: ColumnDef<Category>[] = [
  { accessorKey: "name", header: "分类名称" },
  { accessorKey: "sort", header: "排序" },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => (
      <span>{row.original.status === 0 ? "启用" : "禁用"}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("zh-CN"),
  },
]

const fields = [
  { name: "name", label: "分类名称", type: "text" as const, required: true },
  { name: "sort", label: "排序", type: "number" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "启用", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function CategoryPage() {
  return (
    <CrudPage<Category>
      title="商品分类"
      description="管理商品分类层级"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/goods/category", params)}
      onCreate={async (values) => api.post("/api/goods/category", values)}
      onUpdate={async (id, values) => api.put(`/api/goods/category?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/goods/category?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索分类名称..."
    />
  )
}
