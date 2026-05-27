"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"

/**
 * 财务综合看板 — 营收/成本/利润核心指标总览
 */
export default function FinanceDashboardPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month")
  const [data, setData] = useState<{
    revenue: number; cost: number; profit: number; margin: number
    revenueGrowth: number; costGrowth: number; profitGrowth: number
  } | null>(null)

  useEffect(() => {
    api.get(`/finance/dashboard?period=${period}`).then((r: any) => setData(r)).catch(() => {
      // demo data
      setData({
        revenue: 528000, cost: 342000, profit: 186000, margin: 35.23,
        revenueGrowth: 12.5, costGrowth: 8.3, profitGrowth: 21.6,
      })
    })
  }, [period])

  if (!data) return <div className="p-6 text-center text-muted-foreground">加载中...</div>

  const cards = [
    { title: "总营收", value: `¥${(data.revenue / 10000).toFixed(1)}万`, change: data.revenueGrowth, format: "+" },
    { title: "总成本", value: `¥${(data.cost / 10000).toFixed(1)}万`, change: data.costGrowth, format: "+", negative: true },
    { title: "净利润", value: `¥${(data.profit / 10000).toFixed(1)}万`, change: data.profitGrowth, format: "+" },
    { title: "利润率", value: `${data.margin.toFixed(1)}%`, change: 0, format: "" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">财务综合看板</h2><p className="text-sm text-muted-foreground mt-1">营收 / 成本 / 利润核心指标总览</p></div>
        <Tabs value={period} onValueChange={v => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="month">本月</TabsTrigger>
            <TabsTrigger value="quarter">本季</TabsTrigger>
            <TabsTrigger value="year">本年</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.title}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{c.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
              {c.change !== 0 && (
                <p className={`text-xs mt-1 ${c.negative ? "text-red-500" : c.change > 0 ? "text-green-500" : "text-red-500"}`}>
                  {c.format}{c.change > 0 ? "↑" : "↓"} {Math.abs(c.change).toFixed(1)}% 较上期
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 月度趋势 */}
        <Card><CardHeader><CardTitle className="text-sm">月度趋势（近6月）</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-around gap-2 pb-1 border-b">
              {[
                { mon: "12月", rev: 42, cost: 30 },
                { mon: "1月", rev: 38, cost: 28 },
                { mon: "2月", rev: 45, cost: 32 },
                { mon: "3月", rev: 48, cost: 33 },
                { mon: "4月", rev: 52, cost: 34 },
                { mon: "5月", rev: 53, cost: 34 },
              ].map(m => (
                <div key={m.mon} className="flex flex-col items-center flex-1">
                  <div className="flex gap-[2px] w-full items-end justify-center" style={{ height: 160 }}>
                    <div className="w-4 bg-blue-400 rounded-t" style={{ height: `${m.rev * 3}px` }} title={`营收${m.rev}万`} />
                    <div className="w-4 bg-orange-300 rounded-t" style={{ height: `${m.cost * 3}px` }} title={`成本${m.cost}万`} />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{m.mon}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 inline-block rounded" /> 营收</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-300 inline-block rounded" /> 成本</span>
            </div>
          </CardContent>
        </Card>

        {/* 收支类别分布 */}
        <Card><CardHeader><CardTitle className="text-sm">收支类别分布</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "商品销售", pct: 62, color: "bg-blue-500" },
                { label: "服务收入", pct: 18, color: "bg-green-500" },
                { label: "平台补贴", pct: 12, color: "bg-purple-500" },
                { label: "其他", pct: 8, color: "bg-gray-400" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span>{item.pct}%</span></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
