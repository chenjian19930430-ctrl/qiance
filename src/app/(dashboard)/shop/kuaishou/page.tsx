"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"
import { Video } from "lucide-react"

interface KuaishouShop extends Record<string, unknown> {
  id: string
  name: string
  code: string
  platform: string
  status: number
  company?: { name: string }
  createdAt: string
}

const columns: ColumnDef<KuaishouShop>[] = [
  { accessorKey: "name", header: "店铺名称" },
  { accessorKey: "code", header: "店铺编码" },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => (
      <span className={row.original.status === 0 ? "text-green-600" : "text-red-500"}>
        {row.original.status === 0 ? "正常" : "禁用"}
      </span>
    ),
  },
  {
    accessorKey: "company",
    header: "所属公司",
    cell: ({ row }) => row.original.company?.name || "-",
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("zh-CN"),
  },
]

const fields = [
  { name: "name", label: "店铺名称", type: "text" as const, required: true },
  { name: "code", label: "店铺编码", type: "text" as const, required: true },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function KuaishouShopPage() {
  return (
    <CrudPage<KuaishouShop>
      title="快手店铺管理"
      description="管理快手平台店铺信息"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/shop?platform=kuaishou", params)}
      onCreate={async (values) => api.post("/api/shop", { ...values, platform: "kuaishou", channel: "kuaishou" })}
      onUpdate={async (id, values) => api.put(`/api/shop?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/shop?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索快手店铺名称..."
    />
  )
}
