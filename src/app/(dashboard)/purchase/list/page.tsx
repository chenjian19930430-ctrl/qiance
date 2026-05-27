"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { api } from "@/lib/api"
import { Plus, Eye, Check, X } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

interface PurchaseOrder {
  id: string
  orderNo: string
  supplierName: string
  status: number
  totalAmount: number
  totalAmountYuan: string
  itemCount: number
  creator: string
  createdAt: string
}

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  0: { label: "草稿", variant: "secondary" },
  1: { label: "待审核", variant: "outline" },
  2: { label: "已确认", variant: "default" },
  3: { label: "部分入库", variant: "secondary" },
  4: { label: "已完成", variant: "default" },
  5: { label: "已取消", variant: "destructive" },
}

const statusOptions = [
  { label: "全部", value: "" },
  { label: "草稿", value: "0" },
  { label: "待审核", value: "1" },
  { label: "已确认", value: "2" },
  { label: "部分入库", value: "3" },
  { label: "已完成", value: "4" },
  { label: "已取消", value: "5" },
]

export default function PurchaseListPage() {
  const router = useRouter()
  const [data, setData] = useState<PurchaseOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, pageSize }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const result = await api.get<{ list: PurchaseOrder[]; total: number }>("/api/purchase", params)
      setData(result.list)
      setTotal(result.total)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const columns: ColumnDef<PurchaseOrder>[] = [
    { header: "采购单号", accessorKey: "orderNo" },
    { header: "供应商", accessorKey: "supplierName" },
    {
      header: "总金额",
      accessorKey: "totalAmountYuan",
      cell: ({ row }) => <span>¥{row.original.totalAmountYuan}</span>,
    },
    { header: "商品项数", accessorKey: "itemCount" },
    {
      header: "状态",
      accessorKey: "status",
      cell: ({ row }) => {
        const s = statusMap[row.original.status] || { label: "未知", variant: "secondary" }
        return <Badge variant={s.variant}>{s.label}</Badge>
      },
    },
    {
      header: "创建时间",
      accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("zh-CN"),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => router.push(`/purchase/${row.original.id}`)}>
            <Eye className="h-3 w-3 mr-1" />查看
          </Button>
          {row.original.status === 1 && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-green-600"
              onClick={async (e) => {
                e.stopPropagation()
                try {
                  await api.put(`/api/purchase?id=${row.original.id}`, { status: 2 })
                  toast.success("已确认")
                  loadData()
                } catch (err: any) {
                  toast.error(err.message)
                }
              }}
            >
              <Check className="h-3 w-3 mr-1" />确认
            </Button>
          )}
          {(row.original.status === 0 || row.original.status === 1) && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-destructive"
              onClick={async (e) => {
                e.stopPropagation()
                try {
                  await api.put(`/api/purchase?id=${row.original.id}`, { status: 5 })
                  toast.success("已取消")
                  loadData()
                } catch (err: any) {
                  toast.error(err.message)
                }
              }}
            >
              <X className="h-3 w-3 mr-1" />取消
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">采购管理</h2>
          <p className="text-sm text-muted-foreground mt-1">管理采购订单</p>
        </div>
        <Button onClick={() => router.push("/purchase/create")}>
          <Plus className="h-4 w-4 mr-2" />新建采购单
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm">
          <Input
            placeholder="搜索采购单号..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-3 h-9 w-[250px]"
          />
        </div>
        <select
          className="border rounded px-3 py-1.5 text-sm bg-background h-9"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        loading={loading}
        emptyText="暂无采购单"
        onRowClick={(row) => router.push(`/purchase/${row.id}`)}
      />
    </div>
  )
}
