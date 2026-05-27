"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Company extends Record<string, unknown> {
  id: string
  name: string
  code: string
  address: string
  phone: string
  contact: string
  status: number
  createdAt: string
}

const columns: ColumnDef<Company>[] = [
  { accessorKey: "name", header: "公司名称" },
  { accessorKey: "code", header: "公司编码" },
  { accessorKey: "address", header: "地址" },
  { accessorKey: "phone", header: "电话" },
  { accessorKey: "contact", header: "联系人" },
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
  { name: "name", label: "公司名称", type: "text" as const, required: true },
  { name: "code", label: "公司编码", type: "text" as const, required: true },
  { name: "address", label: "地址", type: "text" as const },
  { name: "phone", label: "电话", type: "text" as const },
  { name: "contact", label: "联系人", type: "text" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function CompanyPage() {
  return (
    <CrudPage<Company>
      title="公司管理"
      description="管理公司档案信息"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/company", params)}
      onCreate={async (values) => api.post("/api/company", values)}
      onUpdate={async (id, values) => api.put(`/api/company?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/company?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索公司名称..."
    />
  )
}
