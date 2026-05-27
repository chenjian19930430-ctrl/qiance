# 千策（QianCe AI）— 电商AI智能体平台

> 对标企赋八爪鱼电商AI智能体平台的全栈复刻项目

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Next.js 15 + TypeScript + Tailwind CSS 4 + shadcn/ui + Radix UI |
| **后端** | Next.js API Routes + Prisma ORM |
| **数据库** | PostgreSQL 16 |
| **AI** | Vercel AI SDK + OpenAI / MiniMax |
| **实时通信** | Socket.IO |
| **认证** | NextAuth.js v5 (JWT) |
| **图表** | ECharts 5 + echarts-for-react |

## 快速开始

### 开发环境

```bash
# 1. 安装依赖
npm install

# 2. 启动数据库
docker compose up -d postgres

# 3. 初始化数据库
npx prisma migrate dev --name init
npx prisma db seed

# 4. 启动开发服务器（前台 + WebSocket）
npm run dev          # Next.js → http://localhost:3000
npm run ws:dev       # WebSocket → ws://localhost:3001（另开终端）
```

### 生产部署

```bash
# 一键部署（Docker Compose）
./scripts/deploy.sh prod

# 或手动构建
npm run build
npm start
```

生产环境访问 http://localhost:3000

## 项目结构

```
qiance/
├── prisma/
│   ├── schema.prisma          # 数据模型（6个模块·16个Model）
│   └── seed.ts                # 种子数据
├── socket/
│   └── server.js              # WebSocket 实时推送服务
├── scripts/
│   └── deploy.sh              # 部署脚本
├── src/
│   ├── app/
│   │   ├── (auth)/            # 登录 / 注册
│   │   ├── (dashboard)/       # 主面板 — 25+ 功能页面
│   │   │   ├── ai/            # AI智能体（看板·智能体管理·对话）
│   │   │   ├── dashboard/     # 综合看板
│   │   │   ├── company/       # 公司管理
│   │   │   ├── shop/          # 店铺管理
│   │   │   ├── goods/         # 商品管理（SPU/SKU/分类）
│   │   │   ├── order/         # 订单管理（原始/结算/售后）
│   │   │   ├── inventory/     # 库存概览
│   │   │   ├── finance/       # 财务（看板/营收/成本/利润/对账）
│   │   │   ├── supplier/      # 供应链管理
│   │   │   ├── contract/      # 合同管理
│   │   │   └── system/        # 系统设置（用户/角色/部门/岗位/菜单）
│   │   └── api/               # API Routes — 30+ 端点
│   ├── components/ui/         # 通用 UI 组件
│   │   ├── crud-page.tsx      # 通用 CRUD 页面封装
│   │   ├── crud-form.tsx      # 通用 CRUD 表单弹窗
│   │   └── data-table.tsx     # 通用数据表格
│   ├── lib/
│   │   ├── auth.ts            # NextAuth v5 JWT 配置
│   │   ├── prisma.ts          # Prisma 客户端单例
│   │   ├── api.ts             # 前端 API 调用工具
│   │   ├── ai/                # AI SDK + 智能体路由 + 补全函数
│   │   ├── agents/            # 15 个 AI 智能体定义
│   │   └── validations.ts     # Zod 表单验证
│   └── types/                 # TypeScript 类型定义
├── Dockerfile                 # Next.js 多阶段构建
├── Dockerfile.ws              # WebSocket 轻量容器
├── docker-compose.yml         # PostgreSQL + Web + WS 编排
├── next.config.js             # Next.js 配置（standalone 输出）
└── .env.production            # 生产环境模板
```

## 功能模块

### 🧠 AI 智能
- **AI全域看板**：智能体运行状态、Token消耗、调用排行
- **智能体管理**：15个垂直领域智能体，覆盖电商、财税、绩效等
- **AI对话**：WebSocket 实时流式对话，多轮上下文

### 📊 数据分析
- **综合看板**：KPI 卡片 + 渠道营收占比 + 渠道对比表
- **财务综合看板**：营收/成本/利润指标 + 月度趋势 + 收支分布
- **营收分析**：分渠道营收明细 + 环比趋势
- **成本分析**：成本类别分布 + 明细表格 + 趋势标识
- **利润分析**：月度利润趋势 + 利润率指标
- **对账管理**：平台对账 + 差异标识 + 状态维度

### 📦 商品管理（SPU/SKU/分类）
公司 / 店铺 / SPU / SKU / 分类完整 CRUD，含搜索+分页+编辑+删除

### 🛒 订单管理
原始订单 / 结算订单 / 售后订单 — 完整 CRUD 和状态管理

### 🏭 供应链
供应商管理 + 合同管理（含合同文件上传）

### 📋 库存管理
库存概览：SKU 维度的库存状态（正常/偏低/缺货）+ 入库登记

### 💰 财务管理
财务综合看板 / 营收 / 成本 / 利润 / 对账 — 完整的财务数据视图

### 🔐 系统设置
用户 / 角色 / 部门 / 岗位 / 菜单 — 完整 RBAC 权限管理

## 部署架构

```
┌──────────────────────────────────────┐
│  Nginx /反向代理（可选）               │
│  → http://your-domain.com            │
└────────────┬─────────────────────────┘
             │
    ┌────────┴────────┐
    │  qiance-web     │  ← Next.js (端口 3000)
    │  API Routes +   │
    │  SSR + Static   │
    └────────┬────────┘
             │
    ┌────────┴────────┐   ┌──────────────┐
    │  qiance-postgres│   │  qiance-ws   │
    │  PostgreSQL 16  │   │  Socket.IO   │
    │  (端口 5432)     │   │  (端口 3001)  │
    └─────────────────┘   └──────────────┘
```

> **部署方式**：支持 Docker Compose 一键部署、Standalone 构建、`docker build` 独立部署

## Phase 1 功能 ✅

- ✅ 用户注册/登录（NextAuth JWT）
- ✅ RBAC 权限管理（用户/角色/菜单/按钮级）
- ✅ AI对话界面（WebSocket 实时流）
- ✅ 15个智能体 + Agent Router
- ✅ 公司/店铺/商品 CRUD
- ✅ SPU/SKU 管理
- ✅ 订单管理（原始/结算/售后）
- ✅ 财务看板/营收/成本/利润/对账
- ✅ 库存概览 + 入库登记
- ✅ 供应商/合同管理
- ✅ ECharts 看板数据可视化
- ✅ 多租户架构支持

---

*厦门重构艺数科技有限公司 · 千策 QianCe AI*
