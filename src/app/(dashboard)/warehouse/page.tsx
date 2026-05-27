"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Warehouse extends Record<string, unknown> {
  id: string
  name: string
  code: string
  address: string
  contact: string
  phone: string
  status: number
  createdAt: string
}

const columns: ColumnDef<Warehouse>[] = [
  { accessorKey: "name", header: "仓库名称" },
  { accessorKey: "code", header: "编码" },
  { accessorKey: "address", header: "地址" },
  { accessorKey: "contact", header: "联系人" },
  { accessorKey: "phone", header: "电话" },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => (
      <span>{row.original.status === 0 ? "正常" : "禁用"}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("zh-CN"),
  },
]

const fields = [
  { name: "name", label: "仓库名称", type: "text" as const, required: true },
  { name: "code", label: "编码", type: "text" as const, required: true },
  { name: "address", label: "地址", type: "text" as const },
  { name: "contact", label: "联系人", type: "text" as const },
  { name: "phone", label: "电话", type: "phone" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function WarehousePage() {
  return (
    <CrudPage<Warehouse>
      title="仓库管理"
      description="管理仓库信息"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/warehouse", params)}
      onCreate={async (values) => api.post("/api/warehouse", values)}
      onUpdate={async (id, values) => api.put(`/api/warehouse?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/warehouse?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索仓库名称/编码..."
    />
  )
}
