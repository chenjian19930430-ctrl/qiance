"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Sku extends Record<string, unknown> {
  id: string
  name: string
  code: string
  spu?: { id: string; name: string }
  shop?: { id: string; name: string }
  salePrice: number
  costPrice: number
  stock: number
  status: number
  spec: Record<string, string> | null
  createdAt: string
}

const columns: ColumnDef<Sku>[] = [
  { accessorKey: "name", header: "SKU名称" },
  { accessorKey: "code", header: "SKU编码" },
  {
    accessorKey: "spu",
    header: "所属SPU",
    cell: ({ row }) => row.original.spu?.name || "-",
  },
  {
    accessorKey: "shop",
    header: "店铺",
    cell: ({ row }) => row.original.shop?.name || "-",
  },
  {
    accessorKey: "salePrice",
    header: "售价",
    cell: ({ row }) => `¥${Number(row.original.salePrice).toFixed(2)}`,
  },
  {
    accessorKey: "costPrice",
    header: "成本价",
    cell: ({ row }) => `¥${Number(row.original.costPrice).toFixed(2)}`,
  },
  { accessorKey: "stock", header: "库存" },
  {
    accessorKey: "spec",
    header: "规格",
    cell: ({ row }) => {
      const spec = row.original.spec
      if (!spec) return "-"
      return Object.entries(spec).map(([k, v]) => `${k}:${v}`).join(", ")
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => (
      <span className={row.original.status === 0 ? "text-green-600" : "text-muted-foreground"}>
        {row.original.status === 0 ? "正常" : "禁用"}
      </span>
    ),
  },
]

const fields = [
  { name: "name", label: "SKU名称", type: "text" as const, required: true },
  { name: "code", label: "SKU编码", type: "text" as const, required: true },
  { name: "spuId", label: "所属SPU ID", type: "text" as const, placeholder: "输入SPU的ID" },
  { name: "salePrice", label: "售价(元)", type: "number" as const },
  { name: "costPrice", label: "成本价(元)", type: "number" as const },
  { name: "stock", label: "库存", type: "number" as const },
  { name: "spec", label: "规格(JSON)", type: "text" as const, placeholder: '如 {"颜色":"红色","尺寸":"L"}' },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "正常", value: 0 },
    { label: "禁用", value: 1 },
  ]},
]

export default function SkuPage() {
  return (
    <CrudPage<Sku>
      title="SKU管理"
      description="管理SKU规格与价格信息"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/goods/sku", params)}
      onCreate={async (values) => {
        const body: Record<string, unknown> = { ...values }
        body.tenantId = "default"
        if (typeof body.salePrice === "string") body.salePrice = parseFloat(body.salePrice)
        if (typeof body.costPrice === "string") body.costPrice = parseFloat(body.costPrice)
        if (body.stock !== undefined) body.stock = parseInt(String(body.stock))
        body.status = body.status ?? 0
        if (typeof body.spec === "string" && body.spec) {
          try { body.spec = JSON.parse(body.spec as string) } catch {}
        }
        return api.post("/api/goods/sku", body)
      }}
      onUpdate={async (id, values) => {
        const body: Record<string, unknown> = { ...values }
        if (typeof body.salePrice === "string") body.salePrice = parseFloat(body.salePrice)
        if (typeof body.costPrice === "string") body.costPrice = parseFloat(body.costPrice)
        if (body.stock !== undefined) body.stock = parseInt(String(body.stock))
        if (typeof body.spec === "string" && body.spec) {
          try { body.spec = JSON.parse(body.spec as string) } catch {}
        }
        return api.put(`/api/goods/sku?id=${id}`, body)
      }}
      onDelete={async (id) => api.delete(`/api/goods/sku?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索SKU名称..."
    />
  )
}
