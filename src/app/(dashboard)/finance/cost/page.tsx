"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface CostRow {
  id: string
  category: string
  amount: number
  pct: number
  trend: "up" | "down" | "stable"
}

const fakeData: CostRow[] = [
  { id: "1", category: "商品采购", amount: 185000, pct: 54.1, trend: "up" },
  { id: "2", category: "物流配送", amount: 42000, pct: 12.3, trend: "stable" },
  { id: "3", category: "平台佣金", amount: 31000, pct: 9.1, trend: "down" },
  { id: "4", category: "营销推广", amount: 28000, pct: 8.2, trend: "up" },
  { id: "5", category: "人力成本", amount: 26000, pct: 7.6, trend: "stable" },
  { id: "6", category: "技术运维", amount: 15000, pct: 4.4, trend: "down" },
  { id: "7", category: "办公及其他", amount: 15000, pct: 4.4, trend: "stable" },
]

const columns: ColumnDef<CostRow>[] = [
  { header: "成本类别", accessorKey: "category" },
  { header: "金额(元)", accessorKey: "amount", cell: ({ row }) => `¥${row.original.amount.toLocaleString()}` },
  { header: "占比", accessorKey: "pct", cell: ({ row }) => `${row.original.pct}%` },
  {
    header: "趋势", accessorKey: "trend",
    cell: ({ row }) => {
      const m = { up: "↑ 上升", down: "↓ 下降", stable: "→ 持平" }
      const c = { up: "text-red-500", down: "text-green-500", stable: "text-gray-500" }
      return <span className={c[row.original.trend]}>{m[row.original.trend]}</span>
    },
  },
]

export default function CostPage() {
  const totalCost = fakeData.reduce((s, r) => s + r.amount, 0)
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">成本分析</h2><p className="text-sm text-muted-foreground mt-1">本期总成本：¥{totalCost.toLocaleString()}</p></div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-2">
          <CardHeader><CardTitle className="text-sm">成本分布</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fakeData.map(r => (
                <div key={r.id}>
                  <div className="flex justify-between text-xs mb-1"><span>{r.category}</span><span>{r.pct}%</span></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.pct > 20 ? "bg-red-400" : r.pct > 10 ? "bg-orange-400" : "bg-blue-400"}`}
                         style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader><CardTitle className="text-sm">成本明细</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={columns} data={fakeData} total={fakeData.length}
              page={1} pageSize={50} onPageChange={() => {}} onPageSizeChange={() => {}} searchable={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
