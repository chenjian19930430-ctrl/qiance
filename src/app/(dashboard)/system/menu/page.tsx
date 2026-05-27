"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface SysMenu extends Record<string, unknown> {
  id: string
  name: string
  code: string
  type: number
  path: string
  icon: string
  sort: number
  visible: boolean
}

const menuTypeMap: Record<number, string> = {
  0: "目录",
  1: "菜单",
  2: "按钮",
}

const columns: ColumnDef<SysMenu>[] = [
  { accessorKey: "name", header: "菜单名称" },
  { accessorKey: "code", header: "权限编码" },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }) => menuTypeMap[row.original.type] || "未知",
  },
  { accessorKey: "path", header: "路由路径" },
  { accessorKey: "icon", header: "图标" },
  { accessorKey: "sort", header: "排序" },
  {
    accessorKey: "visible",
    header: "可见",
    cell: ({ row }) => (row.original.visible ? "是" : "否"),
  },
]

const fields = [
  { name: "name", label: "菜单名称", type: "text" as const, required: true },
  { name: "code", label: "权限编码", type: "text" as const, required: true },
  { name: "type", label: "类型", type: "select" as const, options: [
    { label: "目录", value: 0 },
    { label: "菜单", value: 1 },
    { label: "按钮", value: 2 },
  ]},
  { name: "path", label: "路由路径", type: "text" as const },
  { name: "icon", label: "图标", type: "text" as const },
  { name: "sort", label: "排序", type: "number" as const },
]

export default function MenuPage() {
  return (
    <CrudPage<SysMenu>
      title="菜单管理"
      description="管理系统菜单与权限"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/system/menu", params)}
      onCreate={async (values) => api.post("/api/system/menu", values)}
      onUpdate={async (id, values) => api.put(`/api/system/menu?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/system/menu?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索菜单名称..."
    />
  )
}
