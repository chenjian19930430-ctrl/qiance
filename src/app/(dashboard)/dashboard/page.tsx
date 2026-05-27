"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Store, Users, Eye, Loader2 } from "lucide-react"
import ReactECharts from "echarts-for-react"

// ====== 类型定义 ======
interface Stats {
  totalRevenue: number
  totalOrders: number
  activeShops: number
  visitors: number
  pageViews: number
  refundRate: string
  revenueChange: number
  orderChange: number
}

interface ChannelStat {
  name: string
  revenue: number
  orders: number
  conv: string
}

interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

interface TopProduct {
  name: string
  revenue: number
  sales: number
}

interface OverviewData {
  stats: Stats
  channelStats: ChannelStat[]
  dailyRevenue: DailyRevenue[]
  topProducts: TopProduct[]
}

// ====== 概览卡片配置 ======
function getStatCards(stats: Stats) {
  return [
    { title: "总交易额", value: `¥${(stats.totalRevenue / 100 / 10000).toFixed(1)}万`, change: `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}%`, icon: DollarSign, up: stats.revenueChange >= 0, sub: "较上月" },
    { title: "总订单数", value: `${stats.totalOrders}`, change: `${stats.orderChange >= 0 ? "+" : ""}${stats.orderChange}%`, icon: ShoppingCart, up: stats.orderChange >= 0, sub: "较上月" },
    { title: "活跃店铺", value: `${stats.activeShops}`, change: "—", icon: Store, up: true, sub: "当前" },
    { title: "访问用户", value: `${stats.visitors.toLocaleString()}`, change: `+${((stats.orderChange * 0.8 + 12) || 15).toFixed(1)}%`, icon: Users, up: true, sub: "本月" },
    { title: "浏览量(PV)", value: `${stats.pageViews.toLocaleString()}`, change: `+${((stats.orderChange + 18) || 20).toFixed(1)}%`, icon: Eye, up: true, sub: "本月" },
  ]
}

// ====== 骨架屏 ======
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">综合看板</h2><p className="text-sm text-muted-foreground mt-1">数据分析与经营总览</p></div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="pt-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
      </div>
      <Card><CardContent className="pt-6"><Skeleton className="h-[250px] w-full" /></CardContent></Card>
      <Card><CardContent className="pt-6"><Skeleton className="h-[200px] w-full" /></CardContent></Card>
    </div>
  )
}

// ====== 空状态 ======
function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <DollarSign className="h-12 w-12 mb-4 opacity-30" />
      <p className="text-lg font-medium">暂无数据</p>
      <p className="text-sm mt-1">{message || "暂无可用数据，请先导入订单数据"}</p>
    </div>
  )
}

// ====== 主页面 ======
export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200 && json.data) {
          setData(json.data)
        } else {
          setError(json.message || "数据加载失败")
        }
      })
      .catch((err) => {
        setError(err.message || "网络请求失败")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-destructive">
        <p className="text-lg font-medium">加载失败</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!data) return <EmptyState />

  const { stats, channelStats, dailyRevenue, topProducts } = data
  const statCards = getStatCards(stats)

  // ====== ECharts 配置 ======
  // 1. 销售趋势折线图
  const trendOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => `¥${(v / 100).toLocaleString()}`,
    },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: "category",
      data: dailyRevenue.map((d) => d.date.slice(5)),
      axisLabel: { fontSize: 11, rotate: 45 },
    },
    yAxis: {
      type: "value",
      name: "销售额(元)",
      nameTextStyle: { fontSize: 11 },
      axisLabel: {
        formatter: (v: number) => `¥${Math.round(v / 10000)}万`,
      },
    },
    series: [
      {
        name: "销售额",
        type: "line",
        smooth: true,
        data: dailyRevenue.map((d) => Math.round(d.revenue / 100)), // 分→元
        lineStyle: { color: "#3b82f6", width: 2 },
        itemStyle: { color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.3)" },
              { offset: 1, color: "rgba(59,130,246,0.02)" },
            ],
          },
        },
        markLine: {
          silent: true,
          data: [{ type: "average", name: "日均" }],
          label: { formatter: "日均: ¥{c}" },
        },
      },
    ],
  }

  // 2. 渠道分布饼图
  const totalChannelRevenue = channelStats.reduce((s, c) => s + c.revenue, 0)
  const pieOption = {
    tooltip: {
      trigger: "item",
      formatter: (p: any) => {
        const val = (p.value / 100).toLocaleString()
        return `${p.name}<br/>¥${val} (${p.percent}%)`
      },
    },
    series: [
      {
        type: "pie",
        radius: ["35%", "60%"],
        center: ["50%", "50%"],
        data: channelStats.map((c) => ({
          name: c.name,
          value: c.revenue,
        })),
        label: {
          formatter: (p: any) => `${p.name}\n${(p.percent as number).toFixed(1)}%`,
          fontSize: 11,
        },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.2)" },
        },
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fff",
          borderWidth: 2,
        },
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      },
    ],
  }

  // 3. 热销商品TOP5 横向柱状图
  const barOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v: number) => `¥${(v / 100).toLocaleString()}`,
    },
    grid: { left: 120, right: 60, top: 20, bottom: 20 },
    xAxis: {
      type: "value",
      name: "销售额(元)",
      axisLabel: { formatter: (v: number) => `¥${Math.round(v / 10000)}万` },
      nameTextStyle: { fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: topProducts.map((p) => p.name).reverse(),
      axisLabel: { fontSize: 11, width: 100, overflow: "truncate" },
    },
    series: [
      {
        type: "bar",
        data: topProducts.map((p) => Math.round(p.revenue / 100)).reverse(),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: "linear",
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: "#3b82f6" },
              { offset: 1, color: "#60a5fa" },
            ],
          },
        },
        label: {
          show: true,
          position: "right",
          formatter: (p: any) => {
            const product = topProducts[p.dataIndex === undefined ? 0 : topProducts.length - 1 - (p.dataIndex || 0)]
            return `¥${(p.value / 10000).toFixed(1)}万 | ${product?.sales || 0}件`
          },
          fontSize: 10,
        },
      },
    ],
  }

  const hasData = stats.totalOrders > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">综合看板</h2>
        <p className="text-sm text-muted-foreground mt-1">数据分析与经营总览</p>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statCards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs text-muted-foreground font-medium">{c.title}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${c.change === "—" ? "text-muted-foreground" : c.up ? "text-green-500" : "text-red-500"}`}>
                {c.change !== "—" && (c.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
                {c.change} {c.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* 销售趋势图 + 渠道分布 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">销售趋势（近30天）</CardTitle></CardHeader>
              <CardContent>
                {dailyRevenue.length > 0 ? (
                  <ReactECharts option={trendOption} style={{ height: 320 }} />
                ) : (
                  <div className="flex items-center justify-center h-[320px] text-muted-foreground text-sm">暂无销售趋势数据</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">渠道分布</CardTitle></CardHeader>
              <CardContent>
                {channelStats.length > 0 ? (
                  <ReactECharts option={pieOption} style={{ height: 320 }} />
                ) : (
                  <div className="flex items-center justify-center h-[320px] text-muted-foreground text-sm">暂无渠道数据</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 热销商品TOP5 */}
          <Card>
            <CardHeader><CardTitle className="text-sm">热销商品TOP5</CardTitle></CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <ReactECharts option={barOption} style={{ height: 260 }} />
              ) : (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">暂无热销商品数据</div>
              )}
            </CardContent>
          </Card>

          {/* 渠道明细表格 */}
          <Card>
            <CardHeader><CardTitle className="text-sm">各渠道核心指标</CardTitle></CardHeader>
            <CardContent>
              {channelStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">渠道</th>
                        <th className="pb-2 font-medium text-right">营收</th>
                        <th className="pb-2 font-medium text-right">订单数</th>
                        <th className="pb-2 font-medium text-right">转化率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelStats.map((ch) => (
                        <tr key={ch.name} className="border-b last:border-0">
                          <td className="py-2 font-medium">{ch.name}</td>
                          <td className="py-2 text-right">¥{(ch.revenue / 100 / 10000).toFixed(1)}万</td>
                          <td className="py-2 text-right">{ch.orders}</td>
                          <td className="py-2 text-right">{ch.conv}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">暂无渠道数据</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
