# 部署方案

## 方案一：Docker Compose 部署（推荐）

适用于自有服务器（VPS/云主机）。

### 前置条件

- Docker & Docker Compose v2
- 域名（可选，配合反向代理）

### 部署步骤

```bash
# 1. 克隆代码
git clone <repo-url> /opt/qiance
cd /opt/qiance

# 2. 配置环境变量
cp .env.production .env
# 编辑 .env，填入真实的数据库密码和API Key

# 3. 一键启动
docker compose up -d --build

# 4. 初始化数据库
docker compose exec web npx prisma migrate deploy
docker compose exec web npx prisma db seed

# 5. 查看状态
docker compose ps
docker compose logs -f
```

### 访问地址

| 服务 | 地址 |
|------|------|
| Web | http://localhost:3000 |
| WS | ws://localhost:3001 |
| DB | localhost:5432 |

### Nginx 反向代理配置（生产推荐）

```nginx
server {
    listen 80;
    server_name qiance.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 方案二：Vercel 部署（前端静态化 + API Routes）

适合团队协作环境，利用 Vercel 的 Serverless 能力。

### 前置条件

- Vercel 账号 (https://vercel.com)
- PostgreSQL 数据库（可用 Supabase / Neon / Railway）

### 部署步骤

#### 方式 A：通过 Vercel Dashboard

1. 登录 Vercel → Add New → Project
2. 导入 Git 仓库（GitHub/GitLab/Bitbucket）
3. Framework Preset 选择 **Next.js**
4. 环境变量配置：

| 变量 | 值 |
|------|-----|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/qiance?schema=public` |
| `AUTH_SECRET` | 随机64位字符串（`openssl rand -base64 64`） |
| `AUTH_URL` | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_WS_URL` | `wss://your-ws-domain.com` (可选) |
| `OPENAI_API_KEY` | `sk-xxx` |
| `MINIMAX_API_KEY` | 可选 |

5. Build Command: `npm run build`
6. Output: `.next`
7. 点击 Deploy

#### 方式 B：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod

# 配置环境变量
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add OPENAI_API_KEY
```

### Vercel + Prisma 部署说明

Vercel 的 Serverless 环境需要特殊处理 Prisma：

1. 确保 `package.json` 包含 `"postinstall": "prisma generate"`
2. 使用 `prisma migrate deploy` 而非 `prisma migrate dev`
3. 数据库建议使用 Supabase（免费额度足够）

---

## 方案三：Cloudflare Pages + D1/Supabase

适合轻量部署，无服务器成本。

### 前置条件

- Cloudflare 账号
- 数据库（Supabase/Neon/任何PostgreSQL）

### 部署步骤

1. Fork 项目到 GitHub
2. Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
3. 选择仓库
4. Framework: **Next.js**
5. Build command: `npm run build`
6. Build output: `.next`
7. 添加环境变量（同上表）
8. Deploy

---

## 方案四：Standalone 直接部署

适合已有 Node.js 运行环境的服务器。

```bash
# 1. 构建
npm ci
npx prisma generate
npm run build

# 2. 启动（Next.js standalone 模式）
NODE_ENV=production node .next/standalone/server.js

# 或用 PM2 守护
npm i -g pm2
pm2 start .next/standalone/server.js --name qiance
```

---

## 数据库策略对比

| 方案 | 适用场景 | 成本 | 维护 |
|------|---------|------|------|
| Docker PostgreSQL | 自有服务器 | 低（只需服务器费用） | 自维护 |
| Supabase | Vercel/Cloudflare | 免费额度足够小项目 | 托管 |
| Neon | Serverless | 免费 0.5GB | 托管 |
| Railway | 快速部署 | 5美元/月起 | 托管 |

推荐：开发用 Docker；生产上线用 Vercel + Supabase。

---

## 环境变量清单

```bash
# === 必需 ===
DATABASE_URL="postgresql://..."
AUTH_SECRET="random-64-char-string"

# === 可选（AI 功能） ===
OPENAI_API_KEY="sk-..."
MINIMAX_API_KEY="sk-..."
AI_PRIMARY_PROVIDER="openai"
AI_PRIMARY_MODEL="gpt-4o-mini"
AI_FALLBACK_PROVIDER="minimax"
AI_FALLBACK_MODEL="minimax-pro"

# === WebSocket（可选，AI对话实时推送需要） ===
NEXT_PUBLIC_WS_URL="wss://..."

# === 应用 URL ===
AUTH_URL="https://..."
NEXT_PUBLIC_APP_URL="https://..."
```

---

## 构建产物预览

构建后路由统计（已验证通过）：

```
页面: 54 路由（含 API 30 + 页面 24）
页面类型: Static = 53, Dynamic(API) = 30
Middleware: 1（认证拦截）
总 JS: 102 KB (First Load)
编译: 0 errors, 0 warnings ✓
```
