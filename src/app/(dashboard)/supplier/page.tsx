"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Supplier extends Record<string, unknown> {
  id: string
  name: string
  code: string
  contact: string
  phone: string
  address: string
  status: number
  remark: string
  createdAt: string
}

const columns: ColumnDef<Supplier>[] = [
  { accessorKey: "name", header: "供应商名称" },
  { accessorKey: "code", header: "编码" },
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
  { name: "name", label: "供应商名称", type: "text" as const, required: true },
  { name: "code", label: "编码", type: "text" as const, required: true },
  { name: "contact", label: "联系人", type: "text" as const },
  { name: "phone", label: "电话", type: "phone" as const },
  { name: "address", label: "地址", type: "text" as const },
  { name: "remark", label: "备注", type: "textarea" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function SupplierPage() {
  return (
    <CrudPage<Supplier>
      title="供应商管理"
      description="管理供应商信息"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/supplier", params)}
      onCreate={async (values) => api.post("/api/supplier", values)}
      onUpdate={async (id, values) => api.put(`/api/supplier?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/supplier?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索供应商名称..."
    />
  )
}
