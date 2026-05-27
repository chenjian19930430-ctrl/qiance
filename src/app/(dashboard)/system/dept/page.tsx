"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface SysDept extends Record<string, unknown> {
  id: string
  name: string
  code: string
  parentId: string
  sort: number
  status: number
  createdAt: string
}

const columns: ColumnDef<SysDept>[] = [
  { accessorKey: "name", header: "部门名称" },
  { accessorKey: "code", header: "部门编码" },
  { accessorKey: "sort", header: "排序" },
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
  { name: "name", label: "部门名称", type: "text" as const, required: true },
  { name: "code", label: "部门编码", type: "text" as const, required: true },
  { name: "parentId", label: "上级部门ID", type: "text" as const },
  { name: "sort", label: "排序", type: "number" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function DeptPage() {
  return (
    <CrudPage<SysDept>
      title="部门管理"
      description="管理组织架构与部门"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/system/dept", params)}
      onCreate={async (values) => api.post("/api/system/dept", values)}
      onUpdate={async (id, values) => api.put(`/api/system/dept?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/system/dept?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索部门名称..."
    />
  )
}
