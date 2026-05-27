"use client"

import { Suspense, useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getAgentByCode, routeToAgent } from "@/lib/agents/router"
import { agents } from "@/lib/agents/agents"
import {
  Bot,
  Send,
  User,
  Copy,
  Check,
  Loader2,
  Bug,
  BugOff,
  ChevronDown,
  ChevronUp,
  Info,
  MessageSquare,
  Plus,
  Trash2,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  agentName?: string
  agentPrompt?: string
  routed?: boolean
  mock?: boolean
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  agentId: string | null
  status: number
  createdAt: string
  updatedAt: string
  _count?: { messages: number }
}

export default function AIChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AIChatContent />
    </Suspense>
  )
}

function AIChatContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialAgent = searchParams.get("agent") || ""

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(initialQuery || "")
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentAgent, setCurrentAgent] = useState(initialAgent)

  // 对话持久化
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [loadingConvs, setLoadingConvs] = useState(true)

  // 加载对话列表
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations?userId=default&pageSize=100")
      const data = await res.json()
      if (data.code === 200) {
        setConversations(data.data.list)
      }
    } catch (e) {
      // 静默失败，列表不影响使用
    } finally {
      setLoadingConvs(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // 加载对话消息
  const loadConversationMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`)
      const data = await res.json()
      if (data.code === 200) {
        const conv = data.data
        const msgs: Message[] = conv.messages.map((m: { id: string; role: string; content: string; agentId: string | null; createdAt: string }) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          agentName: m.agentId ? getAgentByCode(m.agentId)?.name : undefined,
          timestamp: new Date(m.createdAt),
        }))
        setMessages(msgs)
        return conv.agentId
      }
    } catch (e) {
      // ignore
    }
    return null
  }, [])

  // 创建新对话
  const createConversation = useCallback(async (agentCode?: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "default",
          title: agentCode ? `${getAgentByCode(agentCode)?.name || "AI"} 对话` : "新对话",
          agentId: agentCode || null,
        }),
      })
      const data = await res.json()
      if (data.code === 200) {
        setActiveConvId(data.data.id)
        setMessages([])
        await loadConversations()
        return data.data.id
      }
    } catch (e) {
      // ignore
    }
    return null
  }, [loadConversations])

  // 删除对话
  const deleteConversation = useCallback(async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/conversations/${convId}`, { method: "DELETE" })
      if (activeConvId === convId) {
        setActiveConvId(null)
        setMessages([])
      }
      await loadConversations()
    } catch (e) {
      // ignore
    }
  }, [activeConvId, loadConversations])

  // 保存消息到数据库
  const saveMessage = useCallback(async (convId: string, role: string, content: string, agentId?: string) => {
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          role,
          content,
          userId: "default",
          agentId: agentId || currentAgent || undefined,
        }),
      })
    } catch (e) {
      // 静默保存失败
    }
  }, [currentAgent])

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 初始智能体信息
  useEffect(() => {
    if (initialAgent) {
      const agent = getAgentByCode(initialAgent)
      if (agent) {
        setCurrentAgent(initialAgent)
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `您好，我是 **${agent.name}**\n\n${agent.description}\n\n请向我提问，我会用专业知识为你服务。`,
            agentName: agent.name,
            timestamp: new Date(),
          },
        ])
      }
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "您好，我是千策AI助手，请问有什么可以帮助您的？",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // 如果有初始问题，自动发送
  const initialized = useRef(false)
  useEffect(() => {
    if (initialQuery && !initialized.current) {
      initialized.current = true
      handleSend(initialQuery)
    }
  }, [])

  const handleSend = useCallback(async (content?: string) => {
    const text = content || input
    if (!text.trim() || loading) return

    // 路由到智能体
    const targetCode = currentAgent || routeToAgent(text).code
    const agent = getAgentByCode(targetCode)

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // 确保有活动对话
    let convId = activeConvId
    if (!convId) {
      convId = await createConversation(targetCode)
    }

    // 保存用户消息
    if (convId) {
      await saveMessage(convId, "user", text, targetCode)
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          agentCode: currentAgent || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "请求失败")
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.content,
        agentName: data.agentName,
        agentPrompt: debugMode ? data.agentPrompt : undefined,
        routed: data.routed,
        mock: data.mock,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])

      // 保存AI回复
      if (convId) {
        await saveMessage(convId, "assistant", data.content, targetCode)
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `❌ 请求出错：${error instanceof Error ? error.message : "未知错误"}\n\n请检查网络连接或稍后重试。`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, currentAgent, debugMode, activeConvId, createConversation, saveMessage])

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleAgentSwitch(code: string) {
    setCurrentAgent(code)
    window.location.href = `/ai/chat?agent=${code}`
  }

  async function handleNewChat() {
    await createConversation(currentAgent || undefined)
  }

  async function handleSelectConversation(conv: Conversation) {
    setActiveConvId(conv.id)
    if (conv.agentId) {
      setCurrentAgent(conv.agentId)
    }
    await loadConversationMessages(conv.id)
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    return d.toLocaleDateString("zh-CN")
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* 左侧面板：对话列表 + 智能体列表 */}
      <div className="w-64 flex flex-col gap-2">
        {/* 新对话按钮 */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          新建对话
        </Button>

        {/* 对话历史列表 */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b">
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">对话历史</span>
            </div>
          </div>
          <ScrollArea className="flex-1">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8 px-4">
                暂无对话记录<br />
                开始新对话吧
              </div>
            ) : (
              <div className="space-y-0.5 p-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs group hover:bg-accent transition-colors",
                      activeConvId === conv.id && "bg-accent/80"
                    )}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{conv.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 hidden group-hover:block">
                      {conv._count?.messages || 0}条
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => deleteConversation(conv.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* 智能体列表 */}
        <Card className="shrink-0 p-1">
          <ScrollArea className="max-h-48">
            <div className="flex flex-wrap gap-1">
              <Button
                variant={!currentAgent ? "secondary" : "ghost"}
                size="sm"
                className="justify-start text-xs h-7"
                onClick={() => handleAgentSwitch("")}
              >
                <Bot className="h-3 w-3 mr-1 shrink-0" />
                <span>通用</span>
              </Button>
              {agents.map((agent) => (
                <Button
                  key={agent.code}
                  variant={currentAgent === agent.code ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start text-xs h-7"
                  onClick={() => handleAgentSwitch(agent.code)}
                >
                  <Bot className="h-3 w-3 mr-1 shrink-0" />
                  <span className="truncate max-w-20">{agent.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 flex flex-col">
        {/* 工具栏 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {currentAgent && (
              <Badge variant="secondary">
                <Bot className="h-3 w-3 mr-1" />
                {getAgentByCode(currentAgent)?.name}
              </Badge>
            )}
            {messages.some((m) => m.mock) && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                🛟 Mock模式
              </Badge>
            )}
            {activeConvId && conversations.find(c => c.id === activeConvId) && (
              <Badge variant="outline" className="text-xs">
                {conversations.find(c => c.id === activeConvId)?._count?.messages || 0} 条消息
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs"
          >
            {debugMode ? (
              <BugOff className="h-3 w-3 mr-1" />
            ) : (
              <Bug className="h-3 w-3 mr-1" />
            )}
            {debugMode ? "关闭调试" : "调试模式"}
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
                <Bot className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">开始新的对话</p>
                <p className="text-xs mt-1">在下方输入您的问题</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === "system" && debugMode ? (
                    <div className="bg-muted/50 border border-border rounded-lg p-2 mx-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Info className="h-3 w-3" />
                        <span className="font-medium">调试信息</span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  ) : (
                    <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
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
                          {msg.mock && (
                            <Badge variant="outline" className="text-xs text-yellow-600">
                              Mock
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

                        {debugMode && msg.agentPrompt && (
                          <DebugPromptBlock prompt={msg.agentPrompt} />
                        )}

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
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">
                      {currentAgent ? `${getAgentByCode(currentAgent)?.name} 思考中...` : "千策AI思考中..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 输入区域 */}
        <div className="pt-4 border-t space-y-2">
          {/* 快捷指令提示 */}
          {messages.length <= 1 && !loading && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {currentAgent ? (
                <QuickPrompt
                  text="帮我分析一下"
                  onClick={() => setInput("帮我分析一下当前的数据情况")}
                />
              ) : (
                <>
                  <QuickPrompt
                    text="分析最近30天销售数据"
                    onClick={() => setInput("分析最近30天销售数据")}
                  />
                  <QuickPrompt
                    text="计算保本ROI"
                    onClick={() => setInput("帮我计算保本ROI")}
                  />
                  <QuickPrompt
                    text="库存优化建议"
                    onClick={() => setInput("有什么库存优化建议")}
                  />
                </>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder={currentAgent ? `向 ${getAgentByCode(currentAgent)?.name} 提问...` : "输入你想了解的内容..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={loading}
            />
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 子组件 ────────────────────────────────────────

function QuickPrompt({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="shrink-0 text-xs h-7 px-2" onClick={onClick}>
      <MessageSquare className="h-3 w-3 mr-1 shrink-0" />
      {text}
    </Button>
  )
}

function DebugPromptBlock({ prompt }: { prompt: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs text-muted-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
        {expanded ? "隐藏 System Prompt" : "查看 System Prompt"}
      </Button>
      {expanded && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2 mt-1 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
          {prompt}
        </div>
      )}
    </div>
  )
}
