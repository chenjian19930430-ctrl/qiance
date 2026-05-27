"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ProfitRow {
  id: string
  month: string
  revenue: number
  cost: number
  profit: number
  margin: number
  growth: number
}

const fakeData: ProfitRow[] = [
  { id: "1", month: "2026-01", revenue: 380000, cost: 280000, profit: 100000, margin: 26.3, growth: 5.2 },
  { id: "2", month: "2026-02", revenue: 420000, cost: 305000, profit: 115000, margin: 27.4, growth: 15.0 },
  { id: "3", month: "2026-03", revenue: 445000, cost: 318000, profit: 127000, margin: 28.5, growth: 10.4 },
  { id: "4", month: "2026-04", revenue: 480000, cost: 335000, profit: 145000, margin: 30.2, growth: 14.2 },
  { id: "5", month: "2026-05", revenue: 528000, cost: 342000, profit: 186000, margin: 35.2, growth: 28.3 },
]

const columns: ColumnDef<ProfitRow>[] = [
  { header: "月份", accessorKey: "month" },
  { header: "营收", accessorKey: "revenue", cell: ({ row }) => `¥${(row.original.revenue / 10000).toFixed(1)}万` },
  { header: "成本", accessorKey: "cost", cell: ({ row }) => `¥${(row.original.cost / 10000).toFixed(1)}万` },
  { header: "利润", accessorKey: "profit", cell: ({ row }) => `¥${(row.original.profit / 10000).toFixed(1)}万` },
  { header: "利润率", accessorKey: "margin", cell: ({ row }) => `${row.original.margin}%` },
  {
    header: "环比", accessorKey: "growth",
    cell: ({ row }) => (
      <span className={`inline-flex items-center gap-1 ${row.original.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
        {row.original.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {row.original.growth.toFixed(1)}%
      </span>
    ),
  },
]

export default function ProfitPage() {
  const latest = fakeData[fakeData.length - 1]
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">利润分析</h2><p className="text-sm text-muted-foreground mt-1">月度利润趋势与同比分析</p></div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">本期利润</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">¥{(latest.profit / 10000).toFixed(1)}万</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">利润率</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{latest.margin}%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">环比增长</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">+{latest.growth}%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">累计利润</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">¥{(fakeData.reduce((s, r) => s + r.profit, 0) / 10000).toFixed(1)}万</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-sm">利润趋势</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-around gap-3 pb-1 border-b">
              {fakeData.map(m => (
                <div key={m.id} className="flex flex-col items-center flex-1">
                  <div className="w-full flex justify-center gap-1 items-end" style={{ height: 160 }}>
                    <div className="w-5 bg-blue-400 rounded-t transition-all" style={{ height: `${(m.revenue / 6000)}px` }} title={`营收${m.revenue}`} />
                    <div className="w-5 bg-green-400 rounded-t transition-all" style={{ height: `${(m.profit / 6000)}px` }} title={`利润${m.profit}`} />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{m.month.slice(5)}月</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 inline-block rounded" />营收</span><span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 inline-block rounded" />利润</span></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-sm">详细数据</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={columns} data={fakeData} total={fakeData.length}
              page={1} pageSize={50} onPageChange={() => {}} onPageSizeChange={() => {}} searchable={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
