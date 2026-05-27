"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Shop extends Record<string, unknown> {
  id: string
  name: string
  code: string
  platform: string
  status: number
  company?: { name: string }
  createdAt: string
}

const platforms = [
  { label: "淘宝", value: "taobao" },
  { label: "天猫", value: "tmall" },
  { label: "京东", value: "jd" },
  { label: "拼多多", value: "pdd" },
  { label: "抖音", value: "douyin" },
  { label: "快手", value: "kuaishou" },
  { label: "小红书", value: "xiaohongshu" },
  { label: "微信", value: "wechat" },
  { label: "亚马逊", value: "amazon" },
  { label: "其他", value: "other" },
]

const columns: ColumnDef<Shop>[] = [
  { accessorKey: "name", header: "店铺名称" },
  { accessorKey: "code", header: "店铺编码" },
  {
    accessorKey: "platform",
    header: "平台",
    cell: ({ row }) => {
      const p = platforms.find((p) => p.value === row.original.platform)
      return p?.label || row.original.platform
    },
  },
  {
    accessorKey: "company",
    header: "所属公司",
    cell: ({ row }) => row.original.company?.name || "-",
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
  { name: "name", label: "店铺名称", type: "text" as const, required: true },
  { name: "code", label: "店铺编码", type: "text" as const, required: true },
  { name: "platform", label: "平台", type: "select" as const, required: true, options: platforms },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function ShopPage() {
  return (
    <CrudPage<Shop>
      title="店铺管理"
      description="管理所有电商平台店铺"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/shop", params)}
      onCreate={async (values) => api.post("/api/shop", values)}
      onUpdate={async (id, values) => api.put(`/api/shop?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/shop?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索店铺名称..."
    />
  )
}
