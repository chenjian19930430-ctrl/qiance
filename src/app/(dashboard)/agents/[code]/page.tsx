"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { agents } from "@/lib/agents/agents"
import { Bot, Send, Loader2, ArrowLeft, MessageSquare, TrendingUp, ShieldAlert, FileCheck, Wallet, Calculator, Target, PieChart, Image, Bell, Search, Package, Eye, Boxes, BarChart, Headphones } from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp, ShieldAlert, FileCheck, Wallet, Calculator,
  Target, PieChart, Image, Bell, Search,
  Package, Eye, Boxes, BarChart, Headphones, Bot,
}

// Mock action responses per agent code
const mockActions: Record<string, (action: string) => string> = {
  profit_predictor: () => `📊 **利润预测结果**

| 指标 | 本月 | 下月 | 下季度 |
|------|------|------|--------|
| 预计营收 | ¥1,350,000 | ¥1,420,000 | ¥4,200,000 |
| 预计毛利 | ¥571,000 | ¥600,000 | ¥1,780,000 |
| 净利润率 | 18.5% | 19.2% | 19.8% |

> ✅ 模拟预测完成。正式版将接入真实数据。`,

  tax_risk_scanner: () => `🔍 **税务风险扫描报告**

| 风险项 | 状态 | 风险等级 | 建议 |
|--------|------|---------|------|
| 收入申报完整性 | ✅ 匹配 | 低 | — |
| 发票数据一致性 | ⚠️ 异常 | 中 | 3张发票未匹配 |
| 税负率 | ✅ 合理 | 低 | 2.3%（行业均值2.1%） |
| 三流一致 | ⚠️ 存疑 | 中 | 1笔合同与资金流不符 |

> ✅ 模拟扫描完成。正式版将接入真实税务数据。`,

  auto_reconciliation: () => `🔄 **自动对账结果**

| 项目 | 系统金额 | 平台金额 | 差异 |
|------|---------|---------|------|
| 订单金额 | ¥863,200 | ¥863,200 | ¥0 ✅ |
| 回款金额 | ¥812,300 | ¥810,500 | ¥1,800 ⚠️ |
| 退款金额 | ¥38,600 | ¥38,600 | ¥0 ✅ |
| 平台费用 | ¥56,700 | ¥57,900 | ¥1,200 ⚠️ |

> ✅ 模拟对账完成。`,

  cashflow_predictor: () => `💰 **现金流预测报告**

**7天现金流趋势：**
- 今日: ¥327,000
- D+1: ¥297,000
- D+2: ¥312,000
- D+3: ¥342,000
- D+4: ¥332,000
- D+5: ¥318,000
- D+6: ¥359,000

**预警信息：** ✅ 未来7天无资金缺口风险

> ✅ 模拟预测完成。`,

  tax_calculator: () => `🧮 **税费测算结果**

**增值税计算：**
| 项目 | 金额 |
|------|------|
| 销项税额（13%） | ¥166,400 |
| 进项税额（13%） | ¥98,800 |
| 应纳增值税 | ¥67,600 |

**企业所得税测算：**
| 项目 | 金额 |
|------|------|
| 应纳税所得额 | ¥369,300 |
| 应纳所得税（25%） | ¥92,325 |

> ✅ 模拟测算完成。`,

  roi_calculator: () => `🎯 **ROI保本分析**

**基础参数：** 售价¥129 | 成本¥58 | 毛利率55.0%

| 指标 | 数值 |
|------|------|
| 保本ROI | **1.82** |
| 当前ROI | **3.45** |
| 安全边际 | +89.6% ✅ |

> ✅ 模拟计算完成。`,

  budget_allocator: () => `📊 **预算分配方案**

| 计划名称 | 当前预算 | 建议预算 | 调整 |
|---------|---------|---------|------|
| 爆款计划A | ¥2,000 | ¥3,500 | +75% |
| 精准计划B | ¥1,500 | ¥2,000 | +33% |
| 测试计划C | ¥1,000 | ¥500 | -50% |

> ✅ 模拟分配完成。`,

  creative_optimizer: () => `🎨 **素材优选报告**

**优质素材（建议加投）：**
| 素材 | CTR | CVR | 评分 |
|-----|-----|-----|------|
| 场景展示-A | 4.2% | 3.1% | ⭐⭐⭐⭐⭐ |
| 产品特写-B | 3.8% | 2.9% | ⭐⭐⭐⭐ |

**待优化素材：** 2个

> ✅ 模拟优选完成。`,

  campaign_monitor: () => `🔔 **投流监控报告**

监控状态：🟢 正常

| 监控项 | 当前值 | 阈值 | 状态 |
|-------|-------|------|------|
| 日消耗 | ¥18,500 | ¥25,000 | ✅ |
| ROI | 3.15 | 2.0 | ✅ |
| CPM | ¥28.5 | ¥40 | ✅ |

> ✅ 模拟监控完成。`,

  organic_traffic_booster: () => `🔍 **自然流量优化方案**

**标题优化建议：**
| 商品 | 当前标题 | 优化后 | 预估提升 |
|------|---------|--------|---------|
| 商品A | 高品质夏季女装 | 2026夏季新款 气质V领连衣裙 | +23%搜索曝光 |
| 商品B | 家用好物推荐 | 厨房收纳置物架 多功能 | +35%搜索曝光 |

> ✅ 模拟优化完成。`,

  product_analyzer: () => `📦 **商品效能分析**

**畅销TOP 5：**
| SKU | 销量 | 毛利率 | 状态 |
|-----|------|--------|------|
| SKU-001 连衣裙-白-M | 1,280 | 52% | 🔥 热销 |
| SKU-002 连衣裙-黑-M | 1,150 | 55% | 🔥 热销 |
| SKU-003 半身裙-蓝-S | 820 | 48% | ⭐ 稳定 |

**滞销预警：** SKU-031（库存300，30天仅售12件）

> ✅ 模拟分析完成。`,

  competitor_monitor: () => `👁️ **竞品监控报告**

| 竞品 | 价格变化 | 近7天销量 | 应对建议 |
|------|---------|----------|---------|
| 竞品A | ↓5.0% | 2,300 | 关注价格战风险 |
| 竞品B | — | 1,800 | 维持现价 |
| 竞品C | ↑3.0% | 1,200 | 可小幅提价 |

> ✅ 模拟监控完成。`,

  inventory_optimizer: () => `📦 **库存优化建议**

| SKU | 库存 | 近30天销量 | 周转天数 | 建议 |
|-----|------|-----------|---------|------|
| SKU-001 | 500 | 320 | 47天 | ✅ 正常 |
| SKU-005 | 1,200 | 85 | 424天 | 🚨 滞销清仓 |
| SKU-012 | 0 | 280 | — | 🚨 立即补货500件 |

> ✅ 模拟分析完成。`,

  data_analyst: () => `📈 **数据分析结果**

**数据概览（近30天）：**
- 销售额: ¥1,280,000 (+15.3%)
- 订单量: 8,450 单 (+12.1%)
- 客单价: ¥151.5 (+2.9%)
- 转化率: 3.2% (+0.3pp)
- 退款率: 2.1% (-0.1pp)

> ✅ 模拟分析完成。`,
}

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const agent = agents.find((a) => a.code === code)

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (agent) {
      setMessages([
        {
          role: "assistant",
          content: `您好，我是 **${agent.name}**\n\n${agent.description}\n\n请问有什么可以帮助您的？`,
        },
      ])
    }
  }, [agent])

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Bot className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">智能体不存在</h2>
        <p className="text-muted-foreground mb-4">未找到编码为 "{code}" 的智能体</p>
        <Button onClick={() => router.push("/ai/agent")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回智能体列表
        </Button>
      </div>
    )
  }

  const Icon = iconMap[agent.icon] || Bot

  function handleAction(action: string) {
    setActionLoading(true)
    setActionResult(null)
    // Simulate async action
    setTimeout(() => {
      const result = mockActions[code] ? mockActions[code](action) : `✅ ${action} 操作已执行（模拟）`
      setActionResult(result)
      setActionLoading(false)
    }, 1200)
  }

  async function handleChatSend() {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMsg }],
          agentCode: code,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content || "抱歉，暂时无法回复" },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ 请求失败，请稍后重试" },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Get action buttons for this agent
  const actionButtons: { label: string; action: string }[] = (() => {
    const map: Record<string, { label: string; action: string }[]> = {
      profit_predictor: [
        { label: "📊 利润预测", action: "predict" },
        { label: "🎯 目标达成模拟", action: "simulate" },
        { label: "📈 费用分析", action: "cost_analysis" },
      ],
      tax_risk_scanner: [
        { label: "🔍 扫描风险", action: "scan" },
        { label: "📋 三流检查", action: "three_stream" },
        { label: "📄 生成整改方案", action: "fix_plan" },
      ],
      auto_reconciliation: [
        { label: "🔄 开始对账", action: "reconcile" },
        { label: "💰 回款核对", action: "payment_check" },
        { label: "📋 差异处理", action: "diff_handle" },
      ],
      cashflow_predictor: [
        { label: "💰 7天预测", action: "7day" },
        { label: "📅 30天预测", action: "30day" },
        { label: "⚠️ 缺口预警", action: "gap_warning" },
      ],
      tax_calculator: [
        { label: "🧮 增值税计算", action: "vat" },
        { label: "📋 所得税计算", action: "income_tax" },
        { label: "📄 生成申报草稿", action: "draft" },
      ],
      roi_calculator: [
        { label: "🎯 计算保本ROI", action: "calc_roi" },
        { label: "📊 ROI对比", action: "roi_compare" },
        { label: "⚠️ 亏损预警", action: "loss_warning" },
      ],
      budget_allocator: [
        { label: "📊 分配预算", action: "allocate" },
        { label: "📈 加投建议", action: "increase" },
        { label: "📉 减投建议", action: "decrease" },
      ],
      creative_optimizer: [
        { label: "🎨 筛选优质素材", action: "filter_good" },
        { label: "🗑️ 淘汰劣质素材", action: "filter_bad" },
        { label: "🎯 人群匹配分析", action: "audience_match" },
      ],
      campaign_monitor: [
        { label: "📊 监控概览", action: "overview" },
        { label: "⚠️ 亏损检测", action: "loss_detect" },
        { label: "🛑 止损建议", action: "stop_loss" },
      ],
      organic_traffic_booster: [
        { label: "📝 标题优化", action: "title_opt" },
        { label: "🔑 关键词策略", action: "keyword" },
        { label: "📈 搜索排名分析", action: "ranking" },
      ],
      product_analyzer: [
        { label: "📊 SKU效能分析", action: "sku_analysis" },
        { label: "🔥 畅销品识别", action: "hot_products" },
        { label: "💤 滞销品识别", action: "cold_products" },
      ],
      competitor_monitor: [
        { label: "👁️ 竞品动态", action: "competitor_news" },
        { label: "💰 价格监控", action: "price_monitor" },
        { label: "📊 销量对比", action: "sales_compare" },
      ],
      inventory_optimizer: [
        { label: "📦 库存分析", action: "inventory_analysis" },
        { label: "⚠️ 呆滞预警", action: "stale_warning" },
        { label: "📋 补货建议", action: "reorder" },
      ],
      data_analyst: [
        { label: "📈 销售趋势", action: "sales_trend" },
        { label: "📊 商品排行", action: "product_rank" },
        { label: "📋 渠道分析", action: "channel_analysis" },
      ],
    }
    return map[code] || []
  })()

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/ai/agent")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回全部智能体
      </Button>

      {/* 智能体名片 */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-none">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{agent.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
            <p className="text-xs text-muted-foreground mt-1">{agent.shortDesc}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：功能按钮区 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" />
                快捷操作
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

          {/* 智能体信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">智能体信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">分组：</span>
                <span>{agent.group === "finance" ? "财税" : agent.group === "growth" ? "投流增长" : agent.group === "product" ? "商品管理" : "通用"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">关键词：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.keywords.slice(0, 5).map((kw) => (
                    <span key={kw} className="text-xs bg-muted px-2 py-0.5 rounded-full">{kw}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">示例问题：</span>
                <div className="space-y-1 mt-1">
                  {agent.sampleQuestions.map((q) => (
                    <Button
                      key={q}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-left h-auto py-1"
                      onClick={() => {
                        setInput(q)
                      }}
                    >
                      <MessageSquare className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{q}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：对话区 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 操作结果展示区 */}
          {actionLoading && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">执行中...</span>
              </CardContent>
            </Card>
          )}

          {actionResult && (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {actionResult}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 对话区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                与 {agent.name} 对话
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 消息列表 */}
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`rounded-lg p-3 text-sm max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {agent.name} 思考中...
                  </div>
                )}
              </div>

              {/* 输入框 */}
              <div className="flex gap-2">
                <Input
                  placeholder={`向 ${agent.name} 提问...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                  disabled={loading}
                />
                <Button onClick={handleChatSend} disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
