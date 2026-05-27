"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface SysRole extends Record<string, unknown> {
  id: string
  name: string
  code: string
  sort: number
  status: number
  createdAt: string
}

const columns: ColumnDef<SysRole>[] = [
  { accessorKey: "name", header: "角色名称" },
  { accessorKey: "code", header: "角色编码" },
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
  { name: "name", label: "角色名称", type: "text" as const, required: true },
  { name: "code", label: "角色编码", type: "text" as const, required: true },
  { name: "sort", label: "排序", type: "number" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function RolePage() {
  return (
    <CrudPage<SysRole>
      title="角色管理"
      description="管理系统角色与权限"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/system/role", params)}
      onCreate={async (values) => api.post("/api/system/role", values)}
      onUpdate={async (id, values) => api.put(`/api/system/role?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/system/role?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索角色名称..."
    />
  )
}
