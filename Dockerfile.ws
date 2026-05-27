# ============================================================
# 千策 WebSocket 服务（独立轻量容器）
# ============================================================
FROM node:20-alpine

WORKDIR /app

COPY socket/ ./socket/
COPY package.json package-lock.json* ./

RUN npm ci --omit=dev

EXPOSE 3001

CMD ["node", "socket/server.js"]
