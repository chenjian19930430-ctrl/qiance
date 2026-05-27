"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Bot,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
  User,
  Copy,
  Check,
  PenLine,
  ChevronRight,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

// ── 类型 ──────────────────────────────────────────

interface Conversation {
  id: string
  title: string
  agentId: string | null
  status: number
  updatedAt: string
  createdAt: string
}

interface Message {
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
}

// ── 智能体列表 ────────────────────────────────────

const AGENTS = [
  { id: "", name: "通用对话", description: "不限定智能体，自动路由" },
  { id: "operation_assistant", name: "运营助手", description: "电商运营数据分析与优化建议" },
  { id: "customer_service", name: "客服助手", description: "客户咨询与售后问题处理" },
  { id: "product_assistant", name: "商品助手", description: "商品管理与上下架操作" },
  { id: "data_analyst", name: "数据分析助手", description: "销售数据与趋势分析" },
  { id: "marketing_planner", name: "营销策划", description: "营销活动与推广策略" },
  { id: "supply_chain", name: "供应链助手", description: "供应链与物流管理" },
  { id: "finance_assistant", name: "财务助手", description: "财务核算与成本分析" },
  { id: "knowledge_base", name: "知识库助手", description: "企业知识库查询" },
  { id: "cross_border", name: "跨境助手", description: "跨境电商运营支持" },
  { id: "live_stream", name: "直播助手", description: "直播电商策划与执行" },
  { id: "content_creator", name: "内容创作", description: "营销内容与文案创作" },
  { id: "design_assistant", name: "设计助手", description: "视觉设计建议与指导" },
  { id: "training_assistant", name: "培训助手", description: "员工培训与知识考核" },
  { id: "after_sale", name: "售后助手", description: "售后流程与退换货处理" },
  { id: "procurement", name: "采购助手", description: "采购计划与供应商管理" },
]

// ── 模型配置 ───────────────────────────────────────

interface ModelConfig {
  provider: "openai" | "minimax" | "mock"
  model: string
  apiKey: string
  baseUrl: string
}

const MODEL_PRESETS: Record<string, { provider: ModelConfig["provider"]; model: string }> = {
  "openai-gpt4o-mini": { provider: "openai", model: "gpt-4o-mini" },
  "openai-gpt4o": { provider: "openai", model: "gpt-4o" },
  "openai-o3-mini": { provider: "openai", model: "o3-mini" },
  "openai-o4-mini": { provider: "openai", model: "o4-mini" },
  "openai-gpt4.1-nano": { provider: "openai", model: "gpt-4.1-nano" },
  "minimax-pro": { provider: "minimax", model: "minimax-pro" },
  "minimax-max": { provider: "minimax", model: "minimax-max" },
  "minimax-light": { provider: "minimax", model: "minimax-light" },
}

const MODEL_OPTIONS = [
  { value: "openai-gpt4o-mini", label: "OpenAI GPT-4o-mini", group: "OpenAI" },
  { value: "openai-gpt4o", label: "OpenAI GPT-4o", group: "OpenAI" },
  { value: "openai-o3-mini", label: "OpenAI o3-mini", group: "OpenAI" },
  { value: "openai-o4-mini", label: "OpenAI o4-mini", group: "OpenAI" },
  { value: "openai-gpt4.1-nano", label: "OpenAI GPT-4.1-nano", group: "OpenAI" },
  { value: "minimax-pro", label: "MiniMax MiniMax-Pro", group: "MiniMax" },
  { value: "minimax-max", label: "MiniMax MiniMax-Max", group: "MiniMax" },
  { value: "minimax-light", label: "MiniMax MiniMax-Light", group: "MiniMax" },
]

// ── 主页面 ────────────────────────────────────────

export default function ChatPage() {
  // 状态
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [agentSelectOpen, setAgentSelectOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // 模型配置
  const [modelSettingsOpen, setModelSettingsOpen] = useState(false)
  const [modelConfig, setModelConfig] = useState<ModelConfig>(() => {
    const envProvider = (process.env.NEXT_PUBLIC_AI_PROVIDER || "openai") as ModelConfig["provider"]
    return {
      provider: envProvider,
      model: process.env.NEXT_PUBLIC_AI_MODEL || "gpt-4o-mini",
      apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || "",
      baseUrl: process.env.NEXT_PUBLIC_AI_BASE_URL || "https://api.openai.com/v1",
    }
  })
  const [modelPreset, setModelPreset] = useState("openai-gpt4o-mini")

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── 加载会话列表 ──
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat")
      const json = await res.json()
      if (json.code === 200) {
        setConversations(json.data)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // ── 切换会话 ──
  const switchConversation = useCallback(async (id: string) => {
    setActiveConvId(id)
    try {
      const res = await fetch(`/api/chat?id=${id}`)
      const json = await res.json()
      if (json.code === 200) {
        setMessages(json.data.messages || [])
      }
    } catch {
      setMessages([])
    }
  }, [])

  // ── 自动滚动 ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // ── 创建新会话 ──
  const handleNewConversation = async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: "新对话",
          agentId: selectedAgent || undefined,
        }),
      })
      const json = await res.json()
      if (json.code === 200) {
        const newConv = json.data
        setConversations((prev) => [newConv, ...prev])
        setActiveConvId(newConv.id)
        setMessages([])
        setInput("")
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    } catch {
      toast.error("创建会话失败")
    }
  }

  // ── 删除会话 ──
  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/chat?id=${id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.code === 200) {
        setConversations((prev) => prev.filter((c) => c.id !== id))
        if (activeConvId === id) {
          setActiveConvId(null)
          setMessages([])
        }
        toast.success("会话已删除")
      }
    } catch {
      toast.error("删除失败")
    }
  }

  // ── 重命名 ──
  const handleRename = async (id: string) => {
    if (!renameTitle.trim()) return
    try {
      const res = await fetch(`/api/chat?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameTitle.trim() }),
      })
      const json = await res.json()
      if (json.code === 200) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: renameTitle.trim() } : c))
        )
        setRenameId(null)
        toast.success("重命名成功")
      }
    } catch {
      toast.error("重命名失败")
    }
  }

  // ── 发送消息 ──
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    if (!activeConvId) {
      // 先创建会话再发送
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            title: text.slice(0, 50),
            agentId: selectedAgent || undefined,
          }),
        })
        const json = await res.json()
        if (json.code !== 200) {
          toast.error("创建会话失败")
          return
        }
        const newConv = json.data
        setConversations((prev) => [newConv, ...prev])
        setActiveConvId(newConv.id)
        // 继续发送
        await doSendMessage(newConv.id, text)
        return
      } catch {
        toast.error("操作失败")
        return
      }
    }

    await doSendMessage(activeConvId, text)
  }, [input, loading, activeConvId, selectedAgent])

  const doSendMessage = async (convId: string, content: string) => {
    // 立即显示用户消息
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: convId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          conversationId: convId,
          content,
          // 传递模型配置，让用户可手动选择
          modelProvider: modelConfig.provider,
          modelName: modelConfig.model,
          apiKey: modelConfig.apiKey || undefined,
          baseUrl: modelConfig.baseUrl || undefined,
        }),
      })
      const json = await res.json()
      if (json.code === 200) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          conversationId: convId,
          role: "assistant",
          content: json.data.content,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, aiMsg])
        // 刷新会话列表（可能有标题更新）
        loadConversations()
      } else {
        toast.error(json.message || "发送失败")
      }
    } catch {
      toast.error("网络错误")
    } finally {
      setLoading(false)
    }
  }

  // ── 复制消息 ──
  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -m-6">
      {/* ── 左侧：会话列表 ── */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 border-r bg-card flex flex-col overflow-hidden shrink-0`}
      >
        <div className="p-3 border-b space-y-2">
          <Button
            variant="default"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleNewConversation}
          >
            <Plus className="h-4 w-4" />
            新建对话
          </Button>

          {/* 智能体选择 */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between text-xs h-8"
              onClick={() => setAgentSelectOpen(true)}
            >
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                {selectedAgent ? AGENTS.find((a) => a.id === selectedAgent)?.name || "通用对话" : "通用对话"}
              </span>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground text-xs py-8">
                暂无对话
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                    activeConvId === conv.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => {
                    if (activeConvId !== conv.id) {
                      switchConversation(conv.id)
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {renameId === conv.id ? (
                    <input
                      className="flex-1 bg-transparent border-b border-primary outline-none text-xs py-0.5"
                      value={renameTitle}
                      onChange={(e) => setRenameTitle(e.target.value)}
                      onBlur={() => handleRename(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(conv.id)
                        if (e.key === "Escape") setRenameId(null)
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 truncate text-xs">{conv.title}</span>
                  )}
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      className="p-1 hover:bg-accent rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        setRenameId(conv.id)
                        setRenameTitle(conv.title)
                      }}
                      title="重命名"
                    >
                      <PenLine className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      className="p-1 hover:bg-destructive/10 rounded"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      title="删除"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ── 右侧：对话区域 ── */}
      <div className="flex-1 flex flex-col">
        {activeConvId ? (
          <>
            {/* 会话标题栏 */}
            <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-7 w-7"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <h3 className="text-sm font-medium truncate max-w-[300px]">
                  {activeConv?.title || "新对话"}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {selectedAgent
                    ? AGENTS.find((a) => a.id === selectedAgent)?.name || "通用"
                    : "通用对话"}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setModelSettingsOpen(true)}
                  title="模型设置"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {modelConfig.provider === "mock"
                    ? "Mock"
                    : modelConfig.provider === "openai"
                    ? "OpenAI"
                    : "MiniMax"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={handleNewConversation}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  新建
                </Button>
              </div>
            </div>

            {/* 消息列表 */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-20">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {selectedAgent
                        ? `开始与 ${AGENTS.find((a) => a.id === selectedAgent)?.name} 对话`
                        : "开始新的对话"}
                    </h3>
                    <p className="text-sm text-muted-foreground/60">
                      {selectedAgent
                        ? AGENTS.find((a) => a.id === selectedAgent)?.description
                        : "我可以帮你分析数据、管理商品、优化运营"}
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        }
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {msg.role === "user" ? "我" : "千策AI"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div
                        className={`rounded-xl p-3 text-sm whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="flex justify-end mt-1">
                        <button
                          className="p-1 hover:bg-accent rounded"
                          onClick={() => copyMessage(msg.content, msg.id)}
                          title="复制"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
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
                    <div className="bg-muted rounded-xl p-4 border">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">思考中...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="border-t p-4 shrink-0">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder={
                    selectedAgent
                      ? `向 ${AGENTS.find((a) => a.id === selectedAgent)?.name} 提问...`
                      : "输入你的问题..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* 无活跃会话时的默认界面 */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Bot className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
              <h2 className="text-2xl font-semibold mb-2">千策 AI 对话</h2>
              <p className="text-muted-foreground text-sm mb-8">
                选择左侧的会话，或创建新对话开始提问
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleNewConversation} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  新建对话
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setAgentSelectOpen(true)}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  选择智能体
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 text-left">
                {[
                  "分析最近30天销售数据",
                  "计算保本ROI",
                  "库存优化建议",
                  "写一份营销文案",
                ].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-auto py-2 px-3"
                    onClick={() => {
                      setInput(q)
                      handleNewConversation()
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
                    <span className="truncate">{q}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 智能体选择对话框 ── */}
      <Dialog open={agentSelectOpen} onOpenChange={setAgentSelectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>选择智能体</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-2">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  selectedAgent === agent.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent"
                }`}
                onClick={() => {
                  setSelectedAgent(agent.id)
                  setAgentSelectOpen(false)
                }}
              >
                <Bot className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{agent.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {agent.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedAgent("")
                setAgentSelectOpen(false)
              }}
            >
              清除选择
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAgentSelectOpen(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 模型设置对话框 ── */}
      <Dialog open={modelSettingsOpen} onOpenChange={setModelSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              模型设置
            </DialogTitle>
            <DialogDescription>
              选择 AI 模型并配置 API Key。设置后将在当前所有对话中生效。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 预设选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">快速选择</label>
              <div className="grid grid-cols-2 gap-2">
                {MODEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`text-left p-2.5 rounded-lg border text-sm transition-colors ${
                      modelPreset === opt.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => {
                      setModelPreset(opt.value)
                      const preset = MODEL_PRESETS[opt.value]
                      if (preset) {
                        setModelConfig((prev) => ({
                          ...prev,
                          provider: preset.provider,
                          model: preset.model,
                          // 切换provider时清空可能不兼容的key
                          apiKey: "",
                        }))
                      }
                    }}
                  >
                    <div className="text-xs font-medium truncate">{opt.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{opt.group}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">或手动配置</span>
              </div>
            </div>

            {/* API Key 输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                API Key
                <span className="text-xs text-muted-foreground ml-2">可选，留空使用 Mock 模式</span>
              </label>
              <Input
                type="password"
                placeholder="sk-... 或 minimax-..."
                value={modelConfig.apiKey}
                onChange={(e) =>
                  setModelConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                }
              />
            </div>

            {/* 自定义 Base URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                API Base URL
                <span className="text-xs text-muted-foreground ml-2">可选</span>
              </label>
              <Input
                placeholder="https://api.openai.com/v1"
                value={modelConfig.baseUrl}
                onChange={(e) =>
                  setModelConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                }
              />
            </div>

            {/* 状态提示 */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">当前状态：</span>
                {modelConfig.apiKey ? (
                  <span className="text-green-600">
                    ✅ 已配置 API Key（{modelConfig.provider === "openai" ? "OpenAI" : "MiniMax"}）
                  </span>
                ) : (
                  <span className="text-amber-600">
                    ⚡ 未配置 Key，将使用 Mock 模式
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                模型：{modelConfig.model}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModelSettingsOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
