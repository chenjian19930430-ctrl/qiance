"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { agents, agentGroups } from "@/lib/agents/agents"
import { Bot, Search, MessageSquare, TrendingUp, ShieldAlert, FileCheck, Wallet, Calculator, Target, PieChart, Image, Bell, Search as SearchIcon, Package, Eye, Boxes, BarChart, Headphones, ArrowRight } from "lucide-react"
import { useState } from "react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp, ShieldAlert, FileCheck, Wallet, Calculator,
  Target, PieChart, Image, Bell, SearchIcon,
  Package, Eye, Boxes, BarChart, Headphones, Bot,
}

export default function AllAgentsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const filtered = agents.filter(
    (a) =>
      a.name.includes(search) || a.description.includes(search) || a.keywords.some((k) => k.includes(search))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">全部智能体</h2>
          <p className="text-sm text-muted-foreground mt-1">
            千策共有 {agents.length} 个智能体，覆盖财税、投流增长、商品管理和通用领域
          </p>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索智能体名称、描述或功能..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 统计数据条 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agentGroups.map((group) => {
          const count = agents.filter((a) => a.group === group.key).length
          return (
            <Card key={group.key}>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">{group.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 分组展示 */}
      {agentGroups.map((group) => {
        const groupAgents = filtered.filter((a) => a.group === group.key)
        if (groupAgents.length === 0) return null
        return (
          <div key={group.key}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              {group.label}
              <span className="text-sm font-normal text-muted-foreground">({groupAgents.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupAgents.map((agent) => {
                const Icon = iconMap[agent.icon] || Bot
                return (
                  <Card
                    key={agent.code}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
                    onClick={() => router.push(`/agents/${agent.code}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-sm">{agent.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-1 flex-wrap mb-2">
                        {agent.keywords.slice(0, 3).map((kw) => (
                          <span key={kw} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                            {kw}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/agents/${agent.code}`)
                          }}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          进入
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/ai/chat?agent=${agent.code}`)
                          }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          对话
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">未找到匹配的智能体</p>
          <p className="text-sm mt-1">请尝试其他关键词搜索</p>
        </div>
      )}
    </div>
  )
}
