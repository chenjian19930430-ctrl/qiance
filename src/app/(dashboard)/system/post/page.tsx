"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface SysPost extends Record<string, unknown> {
  id: string
  name: string
  code: string
  sort: number
  status: number
  remark: string
  createdAt: string
}

const columns: ColumnDef<SysPost>[] = [
  { accessorKey: "name", header: "岗位名称" },
  { accessorKey: "code", header: "岗位编码" },
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
  { name: "name", label: "岗位名称", type: "text" as const, required: true },
  { name: "code", label: "岗位编码", type: "text" as const, required: true },
  { name: "sort", label: "排序", type: "number" as const },
  { name: "remark", label: "备注", type: "textarea" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function PostPage() {
  return (
    <CrudPage<SysPost>
      title="岗位管理"
      description="管理系统岗位"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/system/post", params)}
      onCreate={async (values) => api.post("/api/system/post", values)}
      onUpdate={async (id, values) => api.put(`/api/system/post?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/system/post?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索岗位名称..."
    />
  )
}
