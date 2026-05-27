# 千策（QianCe AI）- 电商AI智能体平台

对标企赋八爪鱼电商AI智能体平台的全栈复刻项目。

## 技术栈

- **前端**：Next.js 15 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **后端**：Next.js API Routes + Prisma ORM
- **数据库**：PostgreSQL
- **AI**：Vercel AI SDK + MiniMax / OpenAI
- **实时通信**：Socket.IO
- **认证**：NextAuth.js v5 (JWT)
- **图表**：ECharts

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置数据库（确保本地有PostgreSQL运行）
cp .env.local .env
# 修改 .env 中的 DATABASE_URL

# 3. 初始化数据库
npx prisma migrate dev --name init
npx prisma db seed

# 4. 启动开发服务器
npm run dev
```

开发服务器运行在 http://localhost:3000

## 项目结构

```
qiance/
├── prisma/                    # 数据模型与迁移
│   └── schema.prisma          # Prisma Schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # 登录/注册页面
│   │   ├── (dashboard)/       # 主面板页面
│   │   └── api/               # API Routes
│   ├── components/            # UI组件
│   ├── lib/                   # 工具库
│   │   ├── auth.ts            # 认证配置
│   │   ├── prisma.ts          # Prisma Client
│   │   ├── agents/            # AI智能体
│   │   └── validations.ts     # 表单验证
│   └── types/                 # TypeScript类型
└── socket/                    # WebSocket服务器
```

## Phase 1 功能

- ✅ 用户注册/登录（密码 + 短信验证码）
- ✅ RBAC 权限管理
- ✅ AI对话界面（WebSocket通信）
- ✅ 15个智能体Prompt + Agent Router
- ✅ 公司/店铺/商品CRUD
- ✅ SKU管理
- ✅ 订单管理
- ✅ ECharts Dashboard
- ✅ 多租户支持
