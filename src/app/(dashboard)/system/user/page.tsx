"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface SysUser extends Record<string, unknown> {
  id: string
  username: string
  realName: string
  phone: string
  email: string
  status: number
  roles: string[]
  createdAt: string
}

const columns: ColumnDef<SysUser>[] = [
  { accessorKey: "username", header: "用户名" },
  { accessorKey: "realName", header: "真实姓名" },
  { accessorKey: "phone", header: "手机号" },
  { accessorKey: "email", header: "邮箱" },
  {
    accessorKey: "roles",
    header: "角色",
    cell: ({ row }) => (row.original.roles || []).join(", "),
  },
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
  { name: "username", label: "用户名", type: "text" as const, required: true },
  { name: "realName", label: "真实姓名", type: "text" as const, required: true },
  { name: "password", label: "密码", type: "text" as const, placeholder: "不填则默认123456" },
  { name: "phone", label: "手机号", type: "phone" as const },
  { name: "email", label: "邮箱", type: "text" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function UserPage() {
  return (
    <CrudPage<SysUser>
      title="用户管理"
      description="管理系统用户"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/system/user", params)}
      onCreate={async (values) => api.post("/api/system/user", values)}
      onUpdate={async (id, values) => api.put(`/api/system/user?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/system/user?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索用户名..."
    />
  )
}
