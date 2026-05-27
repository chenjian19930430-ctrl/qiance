const { Server } = require("socket.io")

/**
 * Socket.IO 服务器
 * 处理AI对话WebSocket通信
 */
function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  // 认证中间件
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error("未提供认证token"))
    }

    try {
      // 验证JWT token（简化版，正式版使用完整的JWT验证）
      const jwt = require("jsonwebtoken")
      const decoded = jwt.verify(token, process.env.AUTH_SECRET || "secret")
      socket.user = decoded
      next()
    } catch (error) {
      next(new Error("token验证失败"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`用户连接: ${socket.user?.userId || "unknown"}`)

    // 加入用户的房间
    if (socket.user?.userId) {
      socket.join(`user:${socket.user.userId}`)
    }

    // 处理聊天消息
    socket.on("chat:message", async (data) => {
      try {
        const { conversationId, message, agent } = data

        // 这里会调用AI Agent Router + LLM
        // 当前为演示版本，返回模拟回复
        const response = {
          type: "chat:response",
          conversationId,
          content: `收到消息: "${message}"\n\n这是千策演示版的自动回复。正式版将集成AI模型进行分析。`,
          agent: agent || "general",
          timestamp: new Date().toISOString(),
        }

        // 分段返回（模拟流式效果）
        socket.emit("chat:response", response)
      } catch (error) {
        socket.emit("chat:error", {
          message: "处理消息时发生错误",
          error: String(error),
        })
      }
    })

    // 处理断开连接
    socket.on("disconnect", () => {
      console.log(`用户断开连接: ${socket.user?.userId || "unknown"}`)
    })
  })

  return io
}

module.exports = { initSocketServer }
