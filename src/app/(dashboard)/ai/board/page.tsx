"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { agents, agentGroups } from "@/lib/agents/agents"
import { Bot, Send, TrendingUp, Search, BarChart3, ArrowRight, Sparkles } from "lucide-react"

const quickQuestions = [
  "按月统计测试京东旗舰店各商品的交易额",
  "帮我分析测试京东旗舰店订单的分布趋势",
  "帮我分析退款/异常订单占比情况",
  "测试京东旗舰店各商品的利润排行榜",
]

export default function AiBoardPage() {
  const router = useRouter()
  const [input, setInput] = useState("")

  function handleSend() {
    if (!input.trim()) return
    router.push(`/ai/chat?q=${encodeURIComponent(input.trim())}`)
  }

  function handleQuickQuestion(q: string) {
    router.push(`/ai/chat?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="space-y-6">
      {/* AI对话入口 */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-none">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            Hi，我是千策
          </CardTitle>
          <CardDescription className="text-base">
            你可以向我提问任何关于电商运营、数据分析的问题
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="输入你想了解的内容..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              发送
            </Button>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {quickQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleQuickQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 智能体分组矩阵 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agentGroups.map((group) => {
          const groupAgents = agents.filter((a) => a.group === group.key)
          return (
            <Card key={group.key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  {group.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {groupAgents.map((agent) => (
                    <Button
                      key={agent.code}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-1.5"
                      onClick={() => router.push(`/ai/chat?agent=${agent.code}`)}
                    >
                      <ArrowRight className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{agent.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 快捷Dashboard卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总交易额</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥ 0.00</div>
            <p className="text-xs text-muted-foreground mt-1">本月累计</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总利润</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥ 0.00</div>
            <p className="text-xs text-muted-foreground mt-1">本月累计</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">订单数</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">本月累计</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">退款率</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground mt-1">本月平均</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ShoppingCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
