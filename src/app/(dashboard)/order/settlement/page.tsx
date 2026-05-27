"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle2, AlertCircle, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"
import { api } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

interface SettlementRow {
  id: string
  batchNo: string
  period: string
  platform: string
  orderCount: number
  totalAmount: number
  commission: number
  netAmount: number
  status: "settled" | "pending" | "failed"
}

interface SettlementSummary {
  totalOrders: number
  totalAmount: number | string
  realAmount: number | string
  platformFees: number | string
  logisticsFees: number | string
  netAmount: number
  channelStats: Array<{
    channel: string | null
    _sum: { realAmount: number | null; platformFee: number | null }
    _count: { id: number }
  }>
}

interface SettlementResponse {
  list: SettlementRow[]
  total: number
  summary: SettlementSummary
}

const columns: ColumnDef<SettlementRow>[] = [
  { header: "结算批次", accessorKey: "batchNo" },
  { header: "结算周期", accessorKey: "period" },
  { header: "平台", accessorKey: "platform" },
  { header: "订单数", accessorKey: "orderCount" },
  {
    header: "总金额",
    accessorKey: "totalAmount",
    cell: ({ row }) => `¥${row.original.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    header: "佣金",
    accessorKey: "commission",
    cell: ({ row }) => `¥${row.original.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    header: "净结算",
    accessorKey: "netAmount",
    cell: ({ row }) => `¥${row.original.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    header: "状态", accessorKey: "status",
    cell: ({ row }) => {
      const m: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
        settled: { label: "已结算", icon: <CheckCircle2 className="h-3 w-3" />, cls: "text-green-500" },
        pending: { label: "待结算", icon: <AlertCircle className="h-3 w-3" />, cls: "text-yellow-500" },
        failed: { label: "结算失败", icon: <AlertCircle className="h-3 w-3" />, cls: "text-red-500" },
      }
      const s = m[row.original.status]
      return <span className={`inline-flex items-center gap-1 ${s.cls}`}>{s.icon}{s.label}</span>
    },
  },
]

export default function SettlementPage() {
  const [data, setData] = useState<SettlementRow[]>([])
  const [summary, setSummary] = useState<SettlementSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await api.get<SettlementResponse>("/api/order/settlement", {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchText || undefined,
      })
      setData(result.list || [])
      setTotal(result.total || 0)
      setSummary(result.summary)
    } catch (e) {
      toast.error("加载结算数据失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const settledAmount = summary?.netAmount || 0
  const pendingAmt = data.filter(r => r.status === "pending").reduce((s, r) => s + r.netAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">结算订单</h2><p className="text-sm text-muted-foreground mt-1">平台结算批次管理与查询</p></div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />导出结算单</Button>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">净结算金额</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">¥{(settledAmount / 10000).toFixed(1)}万</p>
            <p className="text-xs text-muted-foreground mt-1">
              总实收 ¥{Number(summary?.realAmount || 0).toFixed(0)} - 佣金 ¥{Number(summary?.platformFees || 0).toFixed(0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">总订单数</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.totalOrders || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">结算范围订单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">平台佣金</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">¥{Number(summary?.platformFees || 0).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              物流费 ¥{Number(summary?.logisticsFees || 0).toFixed(0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">结算批次</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.length}</p>
            <p className="text-xs text-muted-foreground mt-1">按渠道+周自动分组</p>
          </CardContent>
        </Card>
      </div>

      {/* 渠道分平台汇总 */}
      {summary?.channelStats && summary.channelStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summary.channelStats.map((stat, idx) => (
            <Card key={idx} className="bg-muted/30">
              <CardContent className="p-3">
                <p className="text-sm font-medium">{stat.channel || "未知渠道"}</p>
                <p className="text-lg font-bold mt-1">¥{Number(stat._sum.realAmount || 0).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">{stat._count.id} 单 / 佣金 ¥{Number(stat._sum.platformFee || 0).toFixed(0)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 筛选栏 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">日期：</label>
          <input
            type="date"
            className="border rounded px-3 py-1.5 text-sm bg-background h-9"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-muted-foreground">~</span>
          <input
            type="date"
            className="border rounded px-3 py-1.5 text-sm bg-background h-9"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={loadData}><Search className="h-4 w-4 mr-1" />查询</Button>
        <Button size="sm" variant="outline" onClick={() => { setStartDate(""); setEndDate(""); setTimeout(loadData, 0) }}>
          重置
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={1}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        searchable={false}
        loading={loading}
      />
    </div>
  )
}
