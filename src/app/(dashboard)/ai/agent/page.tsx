"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { agents, agentGroups } from "@/lib/agents/agents"
import { Bot, Search, MessageSquare } from "lucide-react"
import { useState } from "react"

export default function AgentListPage() {
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
          <p className="text-muted-foreground">选择智能体开始AI对话</p>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索智能体..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 分组展示 */}
      {agentGroups.map((group) => {
        const groupAgents = filtered.filter((a) => a.group === group.key)
        if (groupAgents.length === 0) return null
        return (
          <div key={group.key}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {group.label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupAgents.map((agent) => (
                <Card
                  key={agent.code}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/ai/chat?agent=${agent.code}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      开始对话
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">未找到匹配的智能体</div>
      )}
    </div>
  )
}
