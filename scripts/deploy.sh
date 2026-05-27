#!/bin/bash
# ============================================================
# 千策（QianCe AI）部署脚本
# 用法:
#   ./scripts/deploy.sh              # 构建并启动（开发环境）
#   ./scripts/deploy.sh prod          # 生产部署
#   ./scripts/deploy.sh build-only    # 仅构建
# ============================================================
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

ENV_FILE=".env.local"
COMPOSE_FILE="docker-compose.yml"

if [[ "${1:-}" == "prod" ]]; then
  ENV_FILE=".env.production"
fi

echo "🔨 千策部署脚本"
echo "═══════════════════════════"
echo "📂 工作目录: $APP_DIR"
echo "📝 环境文件: $ENV_FILE"

# 1. 安装依赖
echo "📦 安装依赖..."
npm ci

# 2. Prisma 生成
echo "🗄️  生成 Prisma Client..."
npx prisma generate

# 3. 数据库迁移（生产环境慎用自动迁移）
if [[ "${1:-}" != "build-only" ]]; then
  if [[ -f "$ENV_FILE" ]]; then
    echo "🔄 应用数据库迁移..."
    npx prisma migrate deploy
  else
    echo "⚠️  未找到 $ENV_FILE，跳过数据库迁移"
  fi
fi

# 4. 构建
echo "🏗️  构建应用..."
npm run build

# 5. 启动
if [[ "${1:-}" == "build-only" ]]; then
  echo "✅ 构建完成！产物: .next/"
  exit 0
fi

if command -v docker-compose &>/dev/null || docker compose version &>/dev/null; then
  echo "🐳 使用 Docker Compose 启动..."
  docker compose up -d --build
  echo "✅ 部署完成！访问 http://localhost:3000"
else
  echo "🚀 直接启动（开发模式）..."
  npm run start &
  echo "✅ 启动中... 访问 http://localhost:3000"
fi
