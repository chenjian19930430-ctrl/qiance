# 千策（QianCe AI）

> 电商AI智能体运营平台
> 厦门重构艺数科技有限公司

对标 [企赋八爪鱼](https://bzy.aiqfwl.com/) 的全栈AI电商智能体平台。

## 技术栈

- **前端**: Next.js 15 + shadcn/ui + Tailwind CSS 4
- **后端**: Next.js API Routes + Prisma ORM + PostgreSQL
- **AI**: Vercel AI SDK + OpenAI / MiniMax
- **WebSocket**: Socket.IO
- **认证**: NextAuth v5 + JWT

## 快速开始

### 前置条件

- Node.js 20+
- PostgreSQL 16+
- npm 或 pnpm

### 安装

```bash
# 安装依赖
npm install

# 初始化数据库
cp .env.local .env  # 修改DATABASE_URL为你的数据库地址
npx prisma generate
npx prisma db push

# 创建种子数据
npm run db:seed

# 启动开发服务器
npm run dev
# WebSocket服务器
npm run socket
```

### 默认管理员

- 账号: admin
- 密码: admin123

## 项目结构

```
qiance/
├── prisma/                # 数据库模型和种子数据
├── socket/                # WebSocket信令服务器
├── src/
│   ├── app/
│   │   ├── (auth)/        # 登录/注册
│   │   ├── (dashboard)/   # 主面板所有页面
│   │   └── api/           # API Routes
│   ├── components/        # 共享组件
│   ├── lib/
│   │   ├── agents/        # 15个智能体定义 + Router
│   │   ├── ai.ts          # AI SDK配置
│   │   ├── auth.ts        # 认证配置
│   │   ├── prisma.ts      # 数据库客户端
│   │   └── validations.ts # Zod校验
│   └── types/             # 类型定义
└── public/                # 静态资源
```

## 智能体矩阵

- **商品管理**: 商品企划、智能选品、品类优化
- **投流增长**: 利润预测、付费推广、流量预测、爆款预测
- **财税管理**: 税务风险扫描、成本分析、营收分析、财务对账、利润分析、凭证生成、风险监测
- **通用**: AI全能助理、千问百答
