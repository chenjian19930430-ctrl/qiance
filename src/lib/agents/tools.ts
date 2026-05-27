/**
 * 智能体数据查询工具函数集
 *
 * 每个工具从千策数据库查询结构化数据，供 AI 智能体使用
 * 返回格式统一的 Dataset 对象，便于 AI 理解
 */

import { prisma } from "@/lib/prisma"

// ── 通用类型 ──────────────────────────────────────

export interface DataColumn {
  key: string
  label: string
  type: "number" | "string" | "date" | "percent"
}

export interface Dataset {
  title: string
  description: string
  columns: DataColumn[]
  rows: Record<string, unknown>[]
  summary?: Record<string, string | number>
}

// ── 工具函数 ──────────────────────────────────────

/**
 * 查询近 N 天销售额统计
 */
export async function querySales(days: number = 30): Promise<Dataset> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // 按日统计销售额
  const dailySales = await prisma.order.groupBy({
    by: ["orderTime"],
    _sum: { realAmount: true },
    where: {
      orderTime: { gte: startDate },
      orderStatus: { not: 4 }, // 4=已退款
    },
  })

  // 按日汇总
  const dayMap = new Map<string, number>()
  for (const item of dailySales) {
    if (item.orderTime) {
      const day = item.orderTime.toISOString().slice(0, 10)
      dayMap.set(day, (dayMap.get(day) || 0) + Number(item._sum.realAmount || 0))
    }
  }

  const sortedDays = Array.from(dayMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const rows = sortedDays.map(([day, amount]) => ({
    date: day,
    sales: Math.round(amount * 100) / 100,
  }))

  // 汇总
  const totalSales = rows.reduce((sum, r) => sum + r.sales, 0)
  const avgDaily = rows.length > 0 ? totalSales / rows.length : 0
  const maxSale = rows.length > 0 ? Math.max(...rows.map((r) => r.sales)) : 0

  return {
    title: `近 ${days} 天销售额统计`,
    description: `从 ${startDate.toISOString().slice(0, 10)} 到今天的每日销售额`,
    columns: [
      { key: "date", label: "日期", type: "date" },
      { key: "sales", label: "销售额 (元)", type: "number" },
    ],
    rows,
    summary: {
      totalSales: Math.round(totalSales * 100) / 100,
      avgDailySales: Math.round(avgDaily * 100) / 100,
      maxDailySales: Math.round(maxSale * 100) / 100,
      daysWithData: rows.length,
    },
  }
}

/**
 * 查询热销商品 TOP N
 */
export async function queryTopProducts(n: number = 10): Promise<Dataset> {
  // 通过 OrderItem 聚合计算各 SKU 的销量和销售额
  const topItems = await prisma.orderItem.groupBy({
    by: ["skuName", "skuId"],
    _sum: { quantity: true, subtotal: true },
    _count: { orderId: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: n,
  })

  const rows = topItems.map((item, idx) => ({
    rank: idx + 1,
    skuName: item.skuName,
    soldQuantity: item._sum.quantity || 0,
    salesAmount: Math.round(Number(item._sum.subtotal || 0) * 100) / 100,
    orderCount: item._count.orderId,
  }))

  return {
    title: `热销商品 TOP ${n}`,
    description: "按销量降序排列的商品排名",
    columns: [
      { key: "rank", label: "排名", type: "number" },
      { key: "skuName", label: "商品名称", type: "string" },
      { key: "soldQuantity", label: "销量", type: "number" },
      { key: "salesAmount", label: "销售额 (元)", type: "number" },
      { key: "orderCount", label: "订单数", type: "number" },
    ],
    rows,
    summary: {
      totalTopSold: rows.reduce((s, r) => s + r.soldQuantity, 0),
      totalTopSales: Math.round(rows.reduce((s, r) => s + r.salesAmount, 0) * 100) / 100,
    },
  }
}

/**
 * 查询订单统计
 */
export async function queryOrderStats(
  startDate?: string,
  endDate?: string,
): Promise<Dataset> {
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate ? new Date(endDate) : new Date()

  const where = {
    orderTime: { gte: start, lte: end },
  }

  // 按订单状态分组统计
  const statusStats = await prisma.order.groupBy({
    by: ["orderStatus"],
    _count: { id: true },
    _sum: { realAmount: true },
    where,
  })

  const statusLabels: Record<number, string> = {
    0: "待付款",
    1: "待发货",
    2: "已发货",
    3: "已完成",
    4: "已退款",
    5: "已关闭",
  }

  const rows = statusStats.map((item) => ({
    orderStatus: item.orderStatus,
    statusLabel: statusLabels[item.orderStatus] || `状态 ${item.orderStatus}`,
    orderCount: item._count.id,
    totalAmount: Math.round(Number(item._sum.realAmount || 0) * 100) / 100,
  }))

  const totalOrders = rows.reduce((s, r) => s + r.orderCount, 0)
  const totalAmount = rows.reduce((s, r) => s + r.totalAmount, 0)

  return {
    title: "订单统计",
    description: `从 ${start.toISOString().slice(0, 10)} 到 ${end.toISOString().slice(0, 10)} 的订单状态分布`,
    columns: [
      { key: "orderStatus", label: "状态编码", type: "number" },
      { key: "statusLabel", label: "状态", type: "string" },
      { key: "orderCount", label: "订单数", type: "number" },
      { key: "totalAmount", label: "金额 (元)", type: "number" },
    ],
    rows,
    summary: {
      totalOrders,
      totalAmount: Math.round(totalAmount * 100) / 100,
      completedOrders: rows.find((r) => r.orderStatus === 3)?.orderCount || 0,
      refundOrders: rows.find((r) => r.orderStatus === 4)?.orderCount || 0,
      refundRate: totalOrders > 0
        ? Math.round(((rows.find((r) => r.orderStatus === 4)?.orderCount || 0) / totalOrders) * 10000) / 100
        : 0,
    },
  }
}

/**
 * 库存预警查询
 */
export async function queryInventoryAlerts(threshold: number = 20): Promise<Dataset> {
  // 查询库存低于阈值的 SKU
  const lowStockSkus = await prisma.sku.findMany({
    where: {
      stock: { lte: threshold, gt: 0 },
      status: 0,
    },
    include: {
      spu: { select: { name: true } },
    },
    orderBy: { stock: "asc" },
    take: 50,
  })

  // 查询缺货 SKU
  const outOfStockSkus = await prisma.sku.findMany({
    where: { stock: 0, status: 0 },
    include: { spu: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  })

  const lowStockRows = lowStockSkus.map((sku) => ({
    skuName: sku.name,
    spuName: sku.spu?.name || "—",
    currentStock: sku.stock,
    threshold,
    status: sku.stock === 0 ? "缺货" : "低库存",
    skuCode: sku.code,
  }))

  const outOfStockRows = outOfStockSkus.map((sku) => ({
    skuName: sku.name,
    spuName: sku.spu?.name || "—",
    currentStock: 0,
    threshold,
    status: "缺货",
    skuCode: sku.code,
  }))

  const allAlerts = [...lowStockRows, ...outOfStockRows]

  return {
    title: "库存预警",
    description: `库存低于 ${threshold} 的 SKU 预警列表`,
    columns: [
      { key: "skuName", label: "SKU 名称", type: "string" },
      { key: "spuName", label: "所属 SPU", type: "string" },
      { key: "currentStock", label: "当前库存", type: "number" },
      { key: "threshold", label: "预警阈值", type: "number" },
      { key: "status", label: "状态", type: "string" },
      { key: "skuCode", label: "SKU 编码", type: "string" },
    ],
    rows: allAlerts,
    summary: {
      lowStockCount: lowStockSkus.length,
      outOfStockCount: outOfStockSkus.length,
      totalAlerts: allAlerts.length,
    },
  }
}

/**
 * 查询店铺列表
 */
export async function queryShops(): Promise<Dataset> {
  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
  })

  const rows = shops.map((shop) => ({
    id: shop.id,
    name: shop.name,
    code: shop.code,
    channel: shop.channel || "—",
    status: shop.status === 1 ? "启用" : "禁用",
    createdAt: shop.createdAt.toISOString().slice(0, 10),
  }))

  return {
    title: "店铺列表",
    description: "系统中所有店铺信息",
    columns: [
      { key: "name", label: "店铺名称", type: "string" },
      { key: "code", label: "编码", type: "string" },
      { key: "channel", label: "渠道", type: "string" },
      { key: "status", label: "状态", type: "string" },
      { key: "createdAt", label: "创建时间", type: "date" },
    ],
    rows,
    summary: { totalShops: shops.length },
  }
}

// ── 工具注册表 ────────────────────────────────────

export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    name: string
    type: "number" | "string" | "boolean"
    description: string
    required?: boolean
  }[]
  handler: (...args: unknown[]) => Promise<Dataset>
}

/**
 * 智能体工具注册表
 * 按功能分类，供 Agent 路由和 Prompt 构建使用
 */
export const agentTools: ToolDefinition[] = [
  {
    name: "querySales",
    description: "查询最近 N 天的销售额趋势，返回每日销售额数据",
    parameters: [
      { name: "days", type: "number", description: "查询天数，默认 30", required: false },
    ],
    handler: async (days: unknown) => querySales(typeof days === "number" ? days : 30),
  },
  {
    name: "queryTopProducts",
    description: "查询热销商品 TOP N，按销量降序排列",
    parameters: [
      { name: "n", type: "number", description: "返回前 N 个商品，默认 10", required: false },
    ],
    handler: async (n: unknown) => queryTopProducts(typeof n === "number" ? n : 10),
  },
  {
    name: "queryOrderStats",
    description: "查询指定时间范围内的订单统计，按订单状态分组",
    parameters: [
      { name: "startDate", type: "string", description: "起始日期，格式 YYYY-MM-DD", required: false },
      { name: "endDate", type: "string", description: "结束日期，格式 YYYY-MM-DD", required: false },
    ],
    handler: async (...args: unknown[]) => {
      const startDate = args[0] as string | undefined
      const endDate = args[1] as string | undefined
      return queryOrderStats(startDate, endDate)
    },
  },
  {
    name: "queryInventoryAlerts",
    description: "查询库存预警，返回库存低于阈值的 SKU 和缺货 SKU",
    parameters: [
      { name: "threshold", type: "number", description: "库存预警阈值，默认 20", required: false },
    ],
    handler: async (threshold: unknown) =>
      queryInventoryAlerts(typeof threshold === "number" ? threshold : 20),
  },
  {
    name: "queryShops",
    description: "查询系统中所有店铺信息列表",
    parameters: [],
    handler: async () => queryShops(),
  },
]

// ── 智能数据查询（自动识别用户意图）────────────────

/**
 * 格式化 Dataset 为 Markdown（供 completion.ts 和 route 共享）
 */
export function formatDatasetForAI(dataset: Dataset): string {
  const parts: string[] = []

  parts.push(`### ${dataset.title}`)
  parts.push(`> ${dataset.description}`)
  parts.push("")

  if (dataset.rows.length > 0) {
    const headers = dataset.columns.map((c) => c.label).join(" | ")
    const separators = dataset.columns.map(() => "---").join(" | ")
    parts.push(`| ${headers} |`)
    parts.push(`| ${separators} |`)

    for (const row of dataset.rows.slice(0, 20)) {
      const cells = dataset.columns.map((c) => {
        const val = row[c.key]
        if (val === null || val === undefined) return "—"
        if (typeof val === "number") {
          if (/amount|sales|price|subtotal|fee|cost/i.test(c.key)) {
            return `¥${val.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`
          }
          return val.toLocaleString("zh-CN")
        }
        return String(val)
      })
      parts.push(`| ${cells.join(" | ")} |`)
    }
  }

  if (dataset.summary && Object.keys(dataset.summary).length > 0) {
    parts.push("")
    for (const [key, val] of Object.entries(dataset.summary)) {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
      if (typeof val === "number") {
        parts.push(`- ${label}: ${val.toLocaleString("zh-CN")}`)
      } else {
        parts.push(`- ${label}: ${val}`)
      }
    }
  }

  return parts.join("\n")
}

/**
 * 智能数据库查询：根据用户自然语言消息，自动识别意图并查询相关数据
 * 供 completion.ts 和 chat route 共享使用
 */
export async function queryDatabaseIntelligence(userMessage: string): Promise<string | null> {
  const lowerMsg = userMessage.toLowerCase()

  const dataKeywords = [
    "销售额", "销量", "订单", "库存", "排行", "top",
    "卖了多少", "赚了多少", "数据", "统计", "趋势",
    "热销", "滞销", "缺货", "周转",
    "最近", "本月", "上月", "本季度",
    "店铺列表", "店铺信息",
  ]

  const isDataQuery = dataKeywords.some((kw) => {
    try { return new RegExp(kw).test(lowerMsg) }
    catch { return lowerMsg.includes(kw) }
  })

  if (!isDataQuery) return null

  const dataSections: string[] = []

  // 销售额相关
  if (/(销售额|销量|赚了多少|卖了多少|趋势|最近)/.test(lowerMsg)) {
    try {
      const salesData = await querySales(30)
      dataSections.push(formatDatasetForAI(salesData))
    } catch { /* silent */ }
  }

  // 排行相关
  if (/(排行|top|热销|畅销|最好|最差)/.test(lowerMsg)) {
    try {
      const topData = await queryTopProducts(10)
      dataSections.push(formatDatasetForAI(topData))
    } catch { /* silent */ }
  }

  // 订单统计
  if (/(订单|统计)/.test(lowerMsg)) {
    try {
      const orderData = await queryOrderStats()
      dataSections.push(formatDatasetForAI(orderData))
    } catch { /* silent */ }
  }

  // 库存预警
  if (/(库存|缺货|预警|补货|呆滞)/.test(lowerMsg)) {
    try {
      const invData = await queryInventoryAlerts(20)
      dataSections.push(formatDatasetForAI(invData))
    } catch { /* silent */ }
  }

  // 店铺
  if (/(店铺|门店|渠道)/.test(lowerMsg)) {
    try {
      const shopData = await queryShops()
      dataSections.push(formatDatasetForAI(shopData))
    } catch { /* silent */ }
  }

  if (dataSections.length === 0) return null

  return [
    "## 📊 来自数据库的真实数据",
    "",
    "以下数据已从千策系统数据库中查询到：",
    "",
    ...dataSections,
    "",
    "请基于以上真实数据回答用户的问题。如果以上数据不足以回答，请告诉用户缺少哪些数据。",
  ].join("\n")
}

/**
 * 根据工具名称执行查询
 */
export async function executeTool(
  toolName: string,
  params: Record<string, unknown> = {},
): Promise<Dataset> {
  const tool = agentTools.find((t) => t.name === toolName)
  if (!tool) {
    throw new Error(`未知工具: ${toolName}`)
  }

  // 提取参数值按顺序传递
  const args = tool.parameters.map((p) => params[p.name])
  return await tool.handler(...args)
}
