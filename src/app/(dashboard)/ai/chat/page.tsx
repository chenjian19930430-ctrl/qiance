"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getAgentByCode } from "@/lib/agents/router"
import { agents } from "@/lib/agents/agents"
import { Bot, Send, User, Copy, Check, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  agentName?: string
  timestamp: Date
}

export default function AIChatPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialAgent = searchParams.get("agent") || ""

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: initialAgent
        ? `您好，我是${getAgentByCode(initialAgent)?.name || "千策AI"}，请问有什么可以帮助您的？`
        : "您好，我是千策AI助手，请问有什么可以帮助您的？",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState(initialQuery || "")
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 如果有初始问题，自动发送
  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 如果有初始智能体选择，自动添加agent info消息
  useEffect(() => {
    if (initialAgent) {
      const agent = getAgentByCode(initialAgent)
      if (agent) {
        setMessages((prev) => [
          ...prev,
          {
            id: "agent-info",
            role: "assistant",
            content: `已切换到 **${agent.name}**\n\n${agent.description}\n\n请向我提问，我会用专业知识为你服务。`,
            agentName: agent.name,
            timestamp: new Date(),
          },
        ])
      }
    }
  }, [])

  async function handleSend(content?: string) {
    const text = content || input
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // TODO: 实际调用AI接口
    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `感谢您的提问！关于"${text}"的问题，千策AI正在分析中。\n\n这是千策演示版的示例回复。正式版将集成AI模型，提供真正的智能分析。\n\n**功能预览：**\n1. 📊 自动数据查询与分析\n2. 📈 可视化图表生成\n3. 💡 业务洞察与建议`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setLoading(false)
    }, 1500)
  }

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* 智能体列表 */}
      <Card className="w-60 p-2 hidden lg:block">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground mb-2">全部智能体</p>
            {agents.map((agent) => (
              <Button
                key={agent.code}
                variant={initialAgent === agent.code ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  window.location.href = `/ai/chat?agent=${agent.code}`
                }}
              >
                <Bot className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">{agent.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* 对话区域 */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {msg.role === "user" ? "我" : msg.agentName || "千策AI"}
                    </span>
                    {msg.agentName && (
                      <Badge variant="secondary" className="text-xs">
                        {msg.agentName}
                      </Badge>
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {msg.content.split("\n").map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString("zh-CN")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyMessage(msg.content, msg.id)}
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 输入框 */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            ref={inputRef}
            placeholder="输入你想了解的内容..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
