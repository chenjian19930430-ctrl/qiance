"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Store, Users, Eye } from "lucide-react"

const statsCards = [
  { title: "总交易额", value: "¥52.8万", change: "+12.5%", icon: DollarSign, up: true, sub: "较上月" },
  { title: "总订单数", value: "822", change: "+8.3%", icon: ShoppingCart, up: true, sub: "较上月" },
  { title: "活跃店铺", value: "4", change: "0%", icon: Store, up: true, sub: "当前" },
  { title: "访问用户", value: "12,580", change: "+18.6%", icon: Users, up: true, sub: "本月" },
  { title: "浏览量(PV)", value: "85,320", change: "+22.1%", icon: Eye, up: true, sub: "本月" },
]

const channelData = [
  { name: "抖音", revenue: 264800, orders: 408, ctr: "3.2%", conv: "2.8%" },
  { name: "快手", revenue: 121000, orders: 221, ctr: "2.8%", conv: "2.1%" },
  { name: "视频号", revenue: 82400, orders: 120, ctr: "2.1%", conv: "1.8%" },
  { name: "淘宝", revenue: 59800, orders: 73, ctr: "1.5%", conv: "1.2%" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">综合看板</h2><p className="text-sm text-muted-foreground mt-1">数据分析与经营总览</p></div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statsCards.map(c => (
          <Card key={c.title}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs text-muted-foreground font-medium">{c.title}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${c.up ? "text-green-500" : "text-red-500"}`}>
                {c.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {c.change} {c.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 渠道占比 */}
      <Card>
        <CardHeader><CardTitle className="text-sm">渠道营收占比</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {channelData.map(ch => {
              const pct = (ch.revenue / channelData.reduce((s, c) => s + c.revenue, 0) * 100).toFixed(1)
              return (
                <div key={ch.name}>
                  <div className="flex justify-between text-sm mb-1"><span className="font-medium">{ch.name}</span><span className="text-muted-foreground">¥{(ch.revenue / 10000).toFixed(1)}万 ({pct}%)</span></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 渠道对比表 */}
      <Card>
        <CardHeader><CardTitle className="text-sm">各渠道核心指标</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">渠道</th>
                <th className="pb-2 font-medium text-right">营收</th>
                <th className="pb-2 font-medium text-right">订单数</th>
                <th className="pb-2 font-medium text-right">点击率</th>
                <th className="pb-2 font-medium text-right">转化率</th>
              </tr></thead>
              <tbody>
                {channelData.map(ch => (
                  <tr key={ch.name} className="border-b last:border-0">
                    <td className="py-2 font-medium">{ch.name}</td>
                    <td className="py-2 text-right">¥{(ch.revenue / 10000).toFixed(1)}万</td>
                    <td className="py-2 text-right">{ch.orders}</td>
                    <td className="py-2 text-right">{ch.ctr}</td>
                    <td className="py-2 text-right">{ch.conv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
