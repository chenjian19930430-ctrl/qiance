"use client"

import { CrudPage } from "@/components/ui/crud-page"
import { api } from "@/lib/api"
import type { ColumnDef } from "@tanstack/react-table"

interface Contract extends Record<string, unknown> {
  id: string
  contractNo: string
  name: string
  type: number
  amount: number | string
  startDate: string | null
  endDate: string | null
  status: number
  remark: string | null
  createdAt: string
}

const contractTypeMap: Record<number, string> = {
  0: "采购合同",
  1: "代销合同",
  2: "服务合同",
}

const contractStatusMap: Record<number, string> = {
  0: "待签署",
  1: "执行中",
  2: "已完成",
  3: "已终止",
}

const columns: ColumnDef<Contract>[] = [
  { accessorKey: "contractNo", header: "合同编号" },
  { accessorKey: "name", header: "合同名称" },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }) => contractTypeMap[row.original.type] || "未知",
  },
  {
    accessorKey: "amount",
    header: "金额",
    cell: ({ row }) => `¥${Number(row.original.amount).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => contractStatusMap[row.original.status] || "未知",
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("zh-CN"),
  },
]

const fields = [
  { name: "contractNo", label: "合同编号", type: "text" as const, required: true },
  { name: "name", label: "合同名称", type: "text" as const, required: true },
  { name: "type", label: "合同类型", type: "select" as const, options: [
    { label: "采购合同", value: 0 },
    { label: "代销合同", value: 1 },
    { label: "服务合同", value: 2 },
  ]},
  { name: "amount", label: "金额", type: "number" as const },
  { name: "status", label: "状态", type: "select" as const, options: [
    { label: "待签署", value: 0 },
    { label: "执行中", value: 1 },
    { label: "已完成", value: 2 },
    { label: "已终止", value: 3 },
  ]},
  { name: "remark", label: "备注", type: "textarea" as const },
]

export default function ContractPage() {
  return (
    <CrudPage<Contract>
      title="合同管理"
      description="管理供应商合同"
      columns={columns}
      fields={fields}
      fetchData={async (params) => api.get("/api/contract", params)}
      onCreate={async (values) => api.post("/api/contract", values)}
      onUpdate={async (id, values) => api.put(`/api/contract?id=${id}`, values)}
      onDelete={async (id) => api.delete(`/api/contract?id=${id}`)}
      getId={(row) => row.id}
      searchable
      searchPlaceholder="搜索合同名称..."
    />
  )
}
