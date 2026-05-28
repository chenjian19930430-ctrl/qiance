"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { agents, AgentConfig } from "@/lib/agents/agents"
import {
  Bot, Send, Loader2, ArrowLeft, MessageSquare,
  TrendingUp, ShieldAlert, FileCheck, Wallet, Calculator,
  Target, PieChart, Image, Bell, Search, Package, Eye, Boxes,
  BarChart, Headphones, Settings, Play, Square, History, Sparkles,
  Copy, Check, Zap, Sliders,
} from "lucide-react"

// ── 图标映射 ──────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp, ShieldAlert, FileCheck, Wallet, Calculator,
  Target, PieChart, Image, Bell, Search,
  Package, Eye, Boxes, BarChart, Headphones, Bot,
}

// ── 对话消息 ──────────────────────────────────────

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// ── 历史记录 ──────────────────────────────────────

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
}

// ── Mock操作结果 ──────────────────────────────────

const mockActions: Record<string, (action: string) => string> = {
  profit_predictor: () => [
    "📊 **利润预测结果**\n",
    "| 指标 | 本月 | 下月 | 下季度 |",
    "|------|------|------|--------|",
    "| 预计营收 | ¥1,350,000 | ¥1,420,000 | ¥4,200,000 |",
    "| 预计毛利 | ¥571,000 | ¥600,000 | ¥1,780,000 |",
    "| 净利润率 | 18.5% | 19.2% | 19.8% |\n",
    "> ✅ 模拟预测完成。正式版将接入真实数据。",
  ].join("\n"),
  tax_risk_scanner: () => [
    "🔍 **税务风险扫描报告**\n",
    "| 风险项 | 状态 | 风险等级 | 建议 |",
    "|--------|------|---------|------|",
    "| 收入申报完整性 | ✅ 匹配 | 低 | — |",
    "| 发票数据一致性 | ⚠️ 异常 | 中 | 3张发票未匹配 |",
    "| 税负率 | ✅ 合理 | 低 | 2.3%（行业均值2.1%） |",
    "| 三流一致 | ⚠️ 存疑 | 中 | 1笔合同与资金流不符 |\n",
    "> ✅ 模拟扫描完成。",
  ].join("\n"),
  roi_calculator: () => [
    "🎯 **ROI保本分析**\n",
    "**基础参数：** 售价¥129 | 成本¥58 | 毛利率55.0%\n",
    "| 指标 | 数值 |",
    "|------|------|",
    "| 保本ROI | **1.82** |",
    "| 当前ROI | **3.45** |",
    "| 安全边际 | +89.6% ✅ |\n",
    "> ✅ 模拟计算完成。",
  ].join("\n"),
  inventory_optimizer: () => [
    "📦 **库存优化建议**\n",
    "| SKU | 库存 | 近30天销量 | 周转天数 | 建议 |",
    "|-----|------|-----------|---------|------|",
    "| SKU-001 | 500 | 320 | 47天 | ✅ 正常 |",
    "| SKU-005 | 1,200 | 85 | 424天 | 🚨 滞销清仓 |",
    "| SKU-012 | 0 | 280 | — | 🚨 立即补货 |\n",
    "> ✅ 模拟分析完成。",
  ].join("\n"),
  data_analyst: () => [
    "📈 **数据分析结果**\n",
    "**数据概览（近30天）：**",
    "- 销售额: ¥1,280,000 (+15.3%)",
    "- 订单量: 8,450 单 (+12.1%)",
    "- 客单价: ¥151.5 (+2.9%)",
    "- 转化率: 3.2% (+0.3pp)",
    "- 退款率: 2.1% (-0.1pp)\n",
    "> ✅ 模拟分析完成。",
  ].join("\n"),
}

function getMockAction(agentCode: string, action: string): string {
  const fn = mockActions[agentCode]
  if (fn) return fn(action)
  return `✅ **${action}** 操作已执行（模拟）\n\n当前为演示模式，正式版将接入真实数据。`
}

// ── 主组件 ────────────────────────────────────────

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const agent = agents.find((a) => a.code === code)

  // 状态
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [config, setConfig] = useState<Record<string, string>>({})
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 初始化配置默认值
  useEffect(() => {
    if (agent?.configFields) {
      const defaults: Record<string, string> = {}
      agent.configFields.forEach((f) => {
        defaults[f.key] = f.defaultValue
      })
      setConfig(defaults)
    }
  }, [agent])

  // 初始化欢迎消息
  useEffect(() => {
    if (agent) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `您好，我是 **${agent.name}**\n\n${agent.description}\n\n请问有什么可以帮助您的？`,
          timestamp: new Date(),
        },
      ])
    }
  }, [agent])

  // 自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Bot className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">智能体不存在</h2>
        <p className="text-muted-foreground mb-4">未找到编码为 "{code}" 的智能体</p>
        <Button onClick={() => router.push("/agents")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回智能体列表
        </Button>
      </div>
    )
  }

  const Icon = iconMap[agent.icon] || Bot

  // ── 操作 ──────────────────────────────────────

  function handleAction(action: string) {
    setActionLoading(true)
    setActionResult(null)
    setTimeout(() => {
      setActionResult(getMockAction(code, action))
      setActionLoading(false)
    }, 800 + Math.random() * 400)
  }

  function handleToggleRunning() {
    if (!agent) return
    setIsRunning(!isRunning)
    setActionResult(!isRunning
      ? `🟢 **${agent.name}** 已启动\n\n${agent.description}\n\n正在等待数据接入...`
      : `🔴 **${agent.name}** 已停止`
    )
  }

  async function handleSend() {
    if (!input.trim() || loading) return

    const text = input.trim()
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          agentCode: code,
        }),
      })
      const data = await res.json()
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.content || "抱歉，暂时无法回复",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "assistant", content: "❌ 请求失败，请稍后重试", timestamp: new Date() },
      ])
    } finally {
      setLoading(false)
    }
  }

  // ── 对话历史 ──────────────────────────────────

  function saveCurrentSession() {
    if (messages.length <= 1) return
    const title = messages[1]?.content?.slice(0, 30) + "..." || "对话"
    const session: ChatSession = {
      id: `s-${Date.now()}`,
      title,
      messages: [...messages],
      createdAt: new Date(),
    }
    setChatSessions((prev) => [session, ...prev.slice(0, 19)])
  }

  function restoreSession(session: ChatSession) {
    setMessages(session.messages)
    setActiveTab("chat")
  }

  function clearChat() {
    saveCurrentSession()
    const name = agent?.name || "AI助手"
    const desc = agent?.description || "智能对话系统"
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `您好，我是 **${name}**\n\n${desc}\n\n请问有什么可以帮助您的？`,
        timestamp: new Date(),
      },
    ])
  }

  // ── 复制 ──────────────────────────────────────

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Action 按钮 ───────────────────────────────

  const actionButtons: { label: string; action: string }[] = (() => {
    const m: Record<string, { label: string; action: string }[]> = {
      profit_predictor: [
        { label: "📊 利润预测", action: "利润预测" },
        { label: "🎯 目标达成模拟", action: "目标达成模拟" },
        { label: "📈 费用分析", action: "费用分析" },
      ],
      tax_risk_scanner: [
        { label: "🔍 扫描风险", action: "扫描风险" },
        { label: "📋 三流检查", action: "三流检查" },
        { label: "📄 生成整改方案", action: "整改方案" },
      ],
      auto_reconciliation: [
        { label: "🔄 开始对账", action: "开始对账" },
        { label: "💰 回款核对", action: "回款核对" },
        { label: "📋 差异处理", action: "差异处理" },
      ],
      cashflow_predictor: [
        { label: "💰 7天预测", action: "7天现金流预测" },
        { label: "📅 30天预测", action: "30天现金流预测" },
        { label: "⚠️ 缺口预警", action: "资金缺口预警" },
      ],
      tax_calculator: [
        { label: "🧮 增值税计算", action: "增值税计算" },
        { label: "📋 所得税计算", action: "企业所得税计算" },
        { label: "📄 生成申报草稿", action: "生成申报草稿" },
      ],
      roi_calculator: [
        { label: "🎯 计算保本ROI", action: "计算保本ROI" },
        { label: "📊 ROI对比", action: "ROI对比分析" },
        { label: "⚠️ 亏损预警", action: "亏损预警检查" },
      ],
      budget_allocator: [
        { label: "📊 分配预算", action: "分配预算" },
        { label: "📈 加投建议", action: "加投建议" },
        { label: "📉 减投建议", action: "减投建议" },
      ],
      creative_optimizer: [
        { label: "🎨 筛选优质素材", action: "筛选优质素材" },
        { label: "🗑️ 淘汰劣质素材", action: "淘汰劣质素材" },
        { label: "🎯 人群匹配分析", action: "人群匹配分析" },
      ],
      campaign_monitor: [
        { label: "📊 监控概览", action: "监控概览" },
        { label: "⚠️ 亏损检测", action: "亏损检测" },
        { label: "🛑 止损建议", action: "止损建议" },
      ],
      organic_traffic_booster: [
        { label: "📝 标题优化", action: "标题优化" },
        { label: "🔑 关键词策略", action: "关键词策略" },
        { label: "📈 搜索排名分析", action: "搜索排名分析" },
      ],
      product_analyzer: [
        { label: "📊 SKU效能分析", action: "SKU效能分析" },
        { label: "🔥 畅销品识别", action: "畅销品识别" },
        { label: "💤 滞销品识别", action: "滞销品识别" },
      ],
      competitor_monitor: [
        { label: "👁️ 竞品动态", action: "竞品动态" },
        { label: "💰 价格监控", action: "价格监控" },
        { label: "📊 销量对比", action: "销量对比" },
      ],
      inventory_optimizer: [
        { label: "📦 库存分析", action: "库存分析" },
        { label: "⚠️ 呆滞预警", action: "呆滞预警" },
        { label: "📋 补货建议", action: "补货建议" },
      ],
      data_analyst: [
        { label: "📈 销售趋势", action: "销售趋势分析" },
        { label: "📊 商品排行", action: "商品排行分析" },
        { label: "📋 渠道分析", action: "渠道分析" },
      ],
      ops_assistant: [
        { label: "💡 运营诊断", action: "运营诊断" },
        { label: "🎯 活动策划", action: "活动策划" },
        { label: "📋 规则解读", action: "规则解读" },
      ],
    }
    return m[code] || []
  })()

  return (
    <div className="space-y-6">
      {/* ── 顶部导航 ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/agents")}>
          <ArrowLeft className="h-4 w-4 mr-2" />返回全部智能体
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={isRunning ? "default" : "outline"} className={isRunning ? "bg-green-600" : ""}>
            <span className={`h-2 w-2 rounded-full mr-1 ${isRunning ? "bg-white animate-pulse" : "bg-muted-foreground"}`} />
            {isRunning ? "运行中" : "已停止"}
          </Badge>
          <Button
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            onClick={handleToggleRunning}
          >
            {isRunning ? <Square className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
            {isRunning ? "停止" : "启动"}
          </Button>
        </div>
      </div>

      {/* ── 智能体名片（增强版） ─────────────── */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-none overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold">{agent.name}</h2>
                <Badge variant="secondary" className="text-xs">
                  {agent.group === "finance" ? "财税" : agent.group === "growth" ? "投流增长" : agent.group === "product" ? "商品管理" : "通用"}
                </Badge>
                {agent.configurable && <Badge variant="outline" className="text-xs"><Settings className="h-3 w-3 mr-1" />可配置</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{agent.shortDesc}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{agent.description}</p>

              {/* 能力标签 */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {agent.capabilities.map((cap) => (
                  <Badge key={cap} variant="secondary" className="text-[10px] px-2 py-0.5">
                    <Zap className="h-2.5 w-2.5 mr-1" />{cap}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 主内容：Tabs ――――――――――――――――― */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-1" />对话
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Zap className="h-4 w-4 mr-1" />快捷操作
          </TabsTrigger>
          <TabsTrigger value="config" disabled={!agent.configurable}>
            <Settings className="h-4 w-4 mr-1" />配置
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-1" />历史
            {chatSessions.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">{chatSessions.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: 对话 ──────────────────────── */}
        <TabsContent value="chat" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* 示例问题侧边栏 */}
            <Card className="lg:col-span-1 hidden lg:block">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />示例问题
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {agent.sampleQuestions.map((q) => (
                  <Button
                    key={q}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-left h-auto py-1.5"
                    onClick={() => {
                      setInput(q)
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1 shrink-0" />
                    <span className="line-clamp-2">{q}</span>
                  </Button>
                ))}
                <Separator className="my-2" />
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={clearChat}>
                  清除对话
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={saveCurrentSession}>
                  保存对话
                </Button>
              </CardContent>
            </Card>

            {/* 对话主区域 */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    与 {agent.name} 对话
                    <span className="text-xs text-muted-foreground font-normal">({messages.length} 条)</span>
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearChat}>
                      清除
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={saveCurrentSession}>
                      保存
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 消息列表 */}
                  <ScrollArea className="h-[420px] pr-3" ref={scrollRef}>
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`rounded-lg p-3 text-sm max-w-[88%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 self-end"
                            onClick={() => copyText(msg.content, msg.id)}
                          >
                            {copiedId === msg.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex gap-3">
                          <div className="bg-muted rounded-lg p-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                          <span className="text-xs text-muted-foreground self-center">{agent.name} 思考中...</span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* 输入框 */}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder={`向 ${agent.name} 提问...`}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      disabled={loading}
                    />
                    <Button onClick={handleSend} disabled={loading || !input.trim()}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* 快捷指令（移动端） */}
                  <div className="flex gap-2 mt-3 overflow-x-auto lg:hidden">
                    {agent.sampleQuestions.slice(0, 3).map((q) => (
                      <Button key={q} variant="outline" size="sm" className="shrink-0 text-xs h-7"
                        onClick={() => setInput(q)}>
                        {q}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: 快捷操作 ──────────────────── */}
        <TabsContent value="actions" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />一键操作
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {actionButtons.map((btn) => (
                    <Button
                      key={btn.action}
                      variant="outline"
                      className="w-full justify-start text-sm"
                      disabled={actionLoading}
                      onClick={() => handleAction(btn.action)}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 结果区域 */}
            <div className="lg:col-span-2">
              <Card className={actionResult ? "border-blue-200 dark:border-blue-800" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">操作结果</CardTitle>
                </CardHeader>
                <CardContent>
                  {actionLoading && (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!actionLoading && !actionResult && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Zap className="h-12 w-12 mb-3 opacity-30" />
                      <p className="text-sm">点击左侧按钮执行操作</p>
                    </div>
                  )}
                  {actionResult && !actionLoading && (
                    <ScrollArea className="max-h-[400px]">
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {actionResult}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: 配置 ──────────────────────── */}
        <TabsContent value="config" className="mt-0">
          {agent.configurable && agent.configFields ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />{agent.name} 参数配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agent.configFields.map((field) => (
                  <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.type === "select" ? (
                      <select
                        className="col-span-2 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        value={config[field.key] || field.defaultValue}
                        onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        className="col-span-2"
                        type={field.type === "number" ? "number" : "text"}
                        value={config[field.key] || field.defaultValue}
                        onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => {}} size="sm">
                    <Sliders className="h-3 w-3 mr-1" />保存配置
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const defaults: Record<string, string> = {}
                    agent.configFields?.forEach((f) => { defaults[f.key] = f.defaultValue })
                    setConfig(defaults)
                  }}>
                    恢复默认
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">⚠️ 当前为演示模式，配置仅存储在本地。</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">该智能体无可配置参数</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Tab: 历史记录 ──────────────────── */}
        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />对话历史
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chatSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">暂无保存的对话历史</p>
                  <p className="text-xs mt-1">点击对话区域的「保存」按钮来保存当前对话</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer border"
                      onClick={() => restoreSession(session)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.messages.length} 条 · {session.createdAt.toLocaleDateString("zh-CN")} {session.createdAt.toLocaleTimeString("zh-CN")}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0 ml-2">恢复</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
