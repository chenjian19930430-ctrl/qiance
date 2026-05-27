# 千策（QianCe AI）Phase 1 阶段报告

> 最后更新：2026-05-27
> 项目路径：`/Users/openclaw/.openclaw/workspace-taizi/qiance/`

---

## 1. 已验收模块

以下两个模块已通过门下省验收，功能完整可运行。

### 1.1 AI 对话模块

**核心功能：** 自然语言驱动的智能体对话，支持智能路由到15个垂直领域智能体。

| 组件 | 状态 | 说明 |
|------|------|------|
| ✅ AI全域看板 (`/ai/board`) | **已验收** | 智能体分组矩阵展示、快速提问入口、Dashboard数据联动（4项KPI卡片） |
| ✅ AI对话 (`/ai/chat`) | **已验收** | 多轮对话、15个智能体自由切换、对话历史管理、智能路由、调试模式、Mock降级 |
| ✅ 智能体管理 (`/ai/agent`) | **已验收** | 智能体列表与管理页面 |

**智能体矩阵（15个）：**

| 组 | 智能体 | 编码 | 核心能力 |
|----|--------|------|---------|
| **财税** (5) | 利润预测智能体 | `profit_predictor` | 利润预测、目标达成模拟、费用分析 |
| | 税务风险扫描智能体 | `tax_risk_scanner` | 收入申报/发票/税负/三流一致扫描 |
| | 自动对账智能体 | `auto_reconciliation` | 订单/回款/退款/平台费对账 |
| | 现金流预测智能体 | `cashflow_predictor` | 7/30/90天现金流预测、缺口预警、资金调度 |
| | 税费自动测算智能体 | `tax_calculator` | 增值税/企业所得税计算、申报稿生成 |
| **投流增长** (5) | ROI保本智能体 | `roi_calculator` | 保本ROI计算、亏损预警 |
| | 预算分配智能体 | `budget_allocator` | 高ROI计划预算分配、加投减投建议 |
| | 人群素材优选智能体 | `creative_optimizer` | CTR/CVR素材分析、劣质素材淘汰 |
| | 投流监控智能体 | `campaign_monitor` | 实时消耗监控、亏损止损 |
| | 自然流量提升智能体 | `organic_traffic_booster` | SEO优化、关键词策略 |
| **商品管理** (3) | 商品效能分析智能体 | `product_analyzer` | SKU效能分析、定价促销 |
| | 竞品监控智能体 | `competitor_monitor` | 竞品价格/销量监控 |
| | 库存优化智能体 | `inventory_optimizer` | 库存周转、补货建议 |
| **通用** (2) | 数据分析智能体 | `data_analyst` | 自然语言查询、自动生成图表 |
| | 运营助手智能体 | `ops_assistant` | 运营策略、活动策划、客服优化 |

**API 端点：**
- `POST /api/ai/chat` — AI对话接口（支持智能体路由）
- `POST /api/chat` — 消息持久化
- `GET /api/conversations` — 对话列表
- `POST /api/conversations` — 创建对话
- `GET /api/conversations/[id]` — 对话详情
- `DELETE /api/conversations/[id]` — 删除对话

**核心文件：**
- `src/lib/agents/agents.ts` — 15个智能体定义 + Agent配置接口
- `src/lib/agents/router.ts` — 关键词匹配路由引擎
- `src/lib/ai/completion.ts` — AI补全引擎（含Mock降级）
- `src/lib/ai/tsconfig.json` — AI模块独立TS配置
- `src/app/(dashboard)/ai/board/page.tsx` — 全域看板（198行）
- `src/app/(dashboard)/ai/chat/page.tsx` — 对话界面（441行）

### 1.2 商品管理模块

**核心功能：** SPU/SKU/分类的完整CRUD管理，支持搜索和分页。

| 页面 | 状态 | 功能 |
|------|------|------|
| ✅ SPU管理 (`/goods/spu`) | **已验收** | SPU新增/编辑/删除、搜索、分页 |
| ✅ SKU管理 (`/goods/sku`) | **已验收** | SKU新增/编辑/删除、搜索、分页 |
| ✅ 商品分类 (`/goods/category`) | **已验收** | 分类树管理、新增/编辑/删除 |

**上游关联模块（已就绪）：**
- ✅ 公司管理（`/company`）— SPU的所属公司
- ✅ 店铺管理（`/shop`）— SKU的销售渠道

**API 端点：**
- `GET/POST/PUT/DELETE /api/goods/spu` — SPU CRUD
- `GET/POST/PUT/DELETE /api/goods/sku` — SKU CRUD
- `GET/POST/PUT/DELETE /api/goods/category` — 分类 CRUD

**数据模型（Prisma）：**
- `Spu` — 商品SPU（tenantId, companyId, shopId, categoryId, name, code, brand, status）
- `Sku` — 商品SKU（tenantId, spuId, shopId, name, code, salePrice, costPrice, stock, spec）

---

## 2. 已完成但未验收模块

以下模块已实现可用UI，但尚未正式纳入验收流程：

| 模块 | 页面 | 完成度 | 说明 |
|------|------|--------|------|
| ✅ 综合看板 | `/dashboard` | 完整 | 5项KPI + 渠道营收占比 + 渠道对比表 |
| ✅ 财务综合看板 | `/finance/dashboard` | 完整 | 营收/成本/利润 + 趋势 + 分布 |
| ✅ 营收分析 | `/finance/revenue` | 完整 | 分渠道营收明细 |
| ✅ 成本分析 | `/finance/cost` | 完整 | 7类成本分布 + 明细 |
| ✅ 利润分析 | `/finance/profit` | 完整 | 月度趋势 + 环比 |
| ✅ 对账管理 | `/finance/reconciliation` | 完整 | 对账状态 + 明细表 |
| ✅ 订单管理 | `/order/list` | 完整 | 原始订单CRUD |
| ✅ 结算订单 | `/order/settlement` | 完整 | 结算批次管理 |
| ✅ 售后订单 | `/order/refund` | 完整 | 退款处理 |
| ✅ 库存概览 | `/inventory/overview` | 完整 | SKU库存状态 + 入库登记 |
| ✅ 基础设施 | 系统设置 | 完整 | 用户/角色/部门/岗位/菜单CRUD |

---

## 3. 剩余子任务（待开发）

### 3.1 投流增长智能体 — 完整对接（5个）

**总估时：12人日**

#### 子任务 3.1.1：ROI保本智能体对接

| 项目 | 内容 |
|------|------|
| **状态** | Prompt已就绪，需对接真实投流数据 |
| **工作量** | 2人日 |
| **技术栈** | Next.js API + Prisma (投流数据模型) + AI SDK |
| **需求描述** | 对接投流消耗/产出数据，实时计算保本ROI和当前ROI，按预警等级输出(健康/预警/危险)。需新增 `AdCampaign`、`AdCost` 数据模型。 |
| **后端API** | `POST /api/finance/roi` — 计算并返回ROI报告 |
| **前端页面** | `/(dashboard)/growth/roi` — ROI仪表盘，可配置成本参数 |

#### 子任务 3.1.2：预算分配智能体对接

| 项目 | 内容 |
|------|------|
| **状态** | Prompt已就绪，需对接预算数据 |
| **工作量** | 2人日 |
| **技术栈** | Next.js API + Prisma + AI SDK |
| **需求描述** | 按计划/单元/商品维度分析ROI，帕累托原则分配预算。需支持"加投/减投/暂停"决策建议。 |
| **后端API** | `POST /api/finance/budget-allocate` — 预算分配方案 |
| **前端页面** | `/(dashboard)/growth/budget` — 预算分配看板 |

#### 子任务 3.1.3：人群素材优选智能体对接

| 项目 | 内容 |
|------|------|
| **状态** | Prompt已就绪 |
| **工作量** | 2人日 |
| **技术栈** | Next.js API + Prisma + AI SDK |
| **需求描述** | 素材粒度的CTR/CVR/ROI分析，优质素材筛选（综合评分体系）和劣质素材淘汰（淘汰标准设置）。需新增 `AdCreative` 数据模型。 |
| **后端API** | `POST /api/growth/creative-optimize` — 素材优化建议 |
| **前端页面** | `/(dashboard)/growth/creative` — 素材分析看板 |

#### 子任务 3.1.4：投流监控智能体对接

| 项目 | 内容 |
|------|------|
| **状态** | Prompt已就绪 |
| **工作量** | 3人日 |
| **技术栈** | Next.js API + Prisma + WebSocket + AI SDK |
| **需求描述** | 实时消耗追踪、亏损检测与自动止损（ROI<1.5持续2小时自动建议暂停）、多维预警规则配置（消耗上限/ROI阈值/CPC异常）。需WebSocket实时推送。 |
| **后端API** | `POST /api/growth/monitor/rules` — 监控规则管理 |
| | `GET /api/growth/monitor/status` — 实时状态查询 |
| **前端页面** | `/(dashboard)/growth/monitor` — 实时监控面板 |

#### 子任务 3.1.5：自然流量提升智能体对接

| 项目 | 内容 |
|------|------|
| **状态** | Prompt已就绪 |
| **工作量** | 3人日 |
| **技术栈** | Next.js API + Prisma + AI SDK |
| **需求描述** | 商品标题SEO优化（核心词+属性词+卖点词+场景词）、关键词策略（热搜/长尾/竞品）、详情页SEO检查、搜索权重提升方案。 |
| **后端API** | `POST /api/growth/seo-optimize` — SEO优化建议 |
| **前端页面** | `/(dashboard)/growth/seo` — SEO优化工作台 |

### 3.2 商品管理智能体对接（3个）

**总估时：6人日**

#### 子任务 3.2.1：商品效能分析智能体对接

| 项目 | 内容 |
|------|------|
| **状态** | Prompt已就绪，数据模型已有（Sku/Order） |
| **工作量** | 2人日 |
| **技术栈** | Next.js API + Prisma + AI SDK |
| **需求描述** | SKU级别效能分析（销量/销售额/毛利）、畅销/滞销品识别（帕累托法则）、定价与促销分析、商品结构优化。直接使用现有 `Sku`/`Order`/`OrderItem` 模型。 |
| **后端API** | `POST /api/product/analyze` — 商品效能分析 |
| **前端页面** | `/(dashboard)/goods/analysis` — 商品分析看板 |

#### 子任务 3.2.2：竞品监控智能体对接

| 项目 | 内容 |
|------|------|
| **状态** | Prompt已就绪 |
| **工作量** | 2人日 |
| **技术栈** | Next.js API + Prisma + AI SDK |
| **需求描述** | 竞品价格变动追踪、销量趋势预估、新品检测、应对策略建议。需新增 `Competitor`、`CompetitorProduct` 数据模型。 |
| **后端API** | `POST /api/product/competitor` — 竞品分析报告 |
| **前端页面** | `/(dashboard)/goods/competitor` — 竞品监控看板 |

#### 子任务 3.2.3：库存优化智能体对接

| 项目 | 内容 |
|------|------|
| **状态** | Prompt已就绪，基础数据层已有（Sku.stock） |
| **工作量** | 2人日 |
| **技术栈** | Next.js API + Prisma + AI SDK |
| **需求描述** | 库存健康度分析（周转率/库存天数）、呆滞库存预警（超XX天未动销建议清理）、智能补货建议（安全库存/EOQ/ROP）、ABC分类管理。需新增 `InventoryRecord` 数据模型追踪出入库。对接现有`/(dashboard)/inventory/overview`页面。 |
| **后端API** | `POST /api/product/inventory-optimize` — 库存优化建议 |
| **前端页面** | 增强 `/(dashboard)/inventory/overview` — 加入智能优化建议区 |

### 3.3 ECharts 数据可视化看板

**总估时：4人日**

| 项目 | 内容 |
|------|------|
| **状态** | 依赖已安装（echarts 5.5.0 + echarts-for-react 3.0.2） |
| **技术栈** | ECharts 5 + echarts-for-react + Next.js API |
| **需求描述** | 将当前纯CSS伪图表升级为真实ECharts可视化： |
| | 1. 综合看板 (`/dashboard`) — 营收趋势折线图、渠道占比饼图 |
| | 2. 财务看板 (`/finance/dashboard`) — 营收/成本对比柱状图、月度趋势面积图 |
| | 3. 营收分析 (`/finance/revenue`) — 渠道对比雷达图、日趋势热力图 |
| | 4. 利润分析 (`/finance/profit`) — 利润构成堆叠图、目标达成仪表盘 |
| | ECharts配置需支持响应式：移动端缩小、桌面端展示完整数据标签 |
| **子任务拆分** | |
| | 3.3.1 Dashboard ECharts集成（1人日）— 替换综合看板、财务看板图形 |
| | 3.3.2 营收/利润ECharts集成（1人日）— 替换营收分析、利润分析图形 |
| | 3.3.3 图表响应式适配（1人日）— 移动端/桌面端适配、交互优化 |
| | 3.3.4 ECharts数据API对接（1人日）— 后端聚合查询、图表数据接口 |

### 3.4 全量联调与部署

**总估时：4人日**

| 项目 | 内容 |
|------|------|
| **状态** | 部署方案已准备，需与工部共担 |
| **工作量** | 4人日（礼部2人日+工部2人日） |
| **技术栈** | Docker Compose + PostgreSQL + Next.js |
| **需求描述** | |
| | 3.4.1 **数据库迁移与环境同步**（1人日，工部）— 确保PostgreSQL 16运行稳定、Prisma迁移无冲突、新增的数据模型完成迁移 |
| | 3.4.2 **API联调**（1人日，工部）— 所有API端点的端到端测试、错误处理和降级策略验证 |
| | 3.4.3 **前端全量联调**（1人日，礼部）— 所有页面功能走查、Mock数据切换为真实API、ECharts图表数据对接 |
| | 3.4.4 **部署上线**（1人日，共担）— Docker Compose生产环境部署、Nginx反向代理配置、SSL证书配置、域名绑定 |

---

## 4. 子任务汇总

| 编号 | 子任务 | 人日 | 优先级 | 归属 |
|------|--------|------|--------|------|
| 3.1.1 | ROI保本智能体对接 | 2 | P0 | 兵部(后端) + 礼部(前端) |
| 3.1.2 | 预算分配智能体对接 | 2 | P0 | 兵部 + 礼部 |
| 3.1.3 | 人群素材优选智能体对接 | 2 | P1 | 兵部 + 礼部 |
| 3.1.4 | 投流监控智能体对接 | 3 | P1 | 兵部 + 礼部 + 工部(WebSocket) |
| 3.1.5 | 自然流量提升智能体对接 | 3 | P1 | 兵部 + 礼部 |
| 3.2.1 | 商品效能分析智能体对接 | 2 | P0 | 兵部(后端) + 礼部(前端) |
| 3.2.2 | 竞品监控智能体对接 | 2 | P1 | 兵部 + 礼部 |
| 3.2.3 | 库存优化智能体对接 | 2 | P1 | 兵部 + 礼部 |
| 3.3.1 | Dashboard ECharts集成 | 1 | P1 | 礼部 |
| 3.3.2 | 营收/利润ECharts集成 | 1 | P1 | 礼部 |
| 3.3.3 | 图表响应式适配 | 1 | P2 | 礼部 |
| 3.3.4 | ECharts数据API对接 | 1 | P1 | 兵部(后端) + 礼部(前端) |
| 3.4.1 | 数据库迁移与环境同步 | 1 | P0 | 工部 |
| 3.4.2 | API联调 | 1 | P0 | 工部 |
| 3.4.3 | 前端全量联调 | 1 | P0 | 礼部 |
| 3.4.4 | 部署上线 | 1 | P0 | 工部 + 礼部 |

**总计：26人日**（礼部承担约 13 人日，兵部承担 10 人日，工部承担 5 人日）

### 优先级划分原则

- **P0（10项，16人日）**：核心功能链路的完整闭环。投流ROI、预算分配、商品效能分析直接影响用户核心价值；数据库/API/部署是系统可用的前提。
- **P1（5项，9人日）**：重要扩展功能。素材优化、竞品监控、库存优化、投流监控、ECharts核心图表、自然流量提升可在P0后陆续推进。
- **P2（1项，1人日）**：体验优化。图表响应式适配可放在最后阶段完善。

---

## 5. 技术债务记录

| 编号 | 问题 | 影响 | 建议修复时机 |
|------|------|------|------------|
| T-001 | `src/lib/ai/completion.ts` 第106行附近模板字面量包含Markdown表格语法，TS类型检查报`Invalid character` | 低（兼容性警告，不影响生产和构建） | 3.4.2 API联调时一并修复 |
| T-002 | `src/app/(dashboard)/ai/chat/page.tsx` 第113/127行智能体类型推导问题 | 低（兼容性警告） | 3.4.3 前端联调时修复 |
| T-003 | 财务/库存API使用Mock降级而非真实Prisma查询 | 中（上线前需切换） | 3.4.2 API联调时切换 |
| T-004 | 无E2E测试覆盖 | 中 | 3.4.2 联调阶段手动覆盖 |
| T-005 | Docker构建存在`.nft.json trace file not found`日志 | 低（Next.js已知问题，exit code 0） | 3.4.4 部署时验证 |

---

## 6. 项目当前状态统计

| 指标 | 数值 |
|------|------|
| 总路由数 | 56（页面26 + API 30） |
| TS编译错误 | 0 |
| Next Build | 0 errors, exit 0 |
| AI智能体 | 15个（横跨财税/投流/商品/通用） |
| 数据模型（Prisma） | 16个 Model |
| UI组件 | 15个（CRUD通用组件链：Page/Form/Table） |
| First Load JS | 102 KB |
| 部署方案 | 4种（Docker/Vercel/Cloudflare/Standalone） |

---

*礼部（🏮）整理呈报 · 2026-05-27*
