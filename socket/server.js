const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 客户端已连接: ${socket.id}`);

  // 加入对话房间
  socket.on('join:conversation', (conversationId) => {
    socket.join(`conv:${conversationId}`);
    console.log(`  → 加入对话: ${conversationId}`);
  });

  // 发送消息
  socket.on('message:send', async (data) => {
    const { conversationId, message, agentId } = data;
    console.log(`  → 收到消息: [${agentId}] ${message}`);

    // 模拟AI回复（流式）
    const responses = {
      'profit-predict': '根据您店铺的历史数据，近7天平均利润率为18.6%，环比增长2.3%。建议关注以下优化点：\n\n1️⃣ **成本优化**：物流成本占比偏高，可考虑优化配送方案\n2️⃣ **定价策略**：爆款商品建议维持当前定价，走量商品可尝试小幅提价\n3️⃣ **品类调整**：高毛利品类占比提升至40%以上',
      'tax-risk': '根据您的财务状况，以下是需要关注的税务风险点：\n\n1. 📋 发票合规性检查（建议每月一次）\n2. 💰 进项税抵扣完整率：92%，尚有优化空间\n3. ⚠️ 跨年费用归集需注意截止时间\n4. ✅ 当前税务评级：B级，有提升至A级的潜力',
      'default': '您好！我是您的AI电商助手。关于您的问题，我可以提供以下分析：\n\n从现有数据来看，建议您从以下几个方面着手：\n\n1. 🔍 **数据分析**：查看近30天的核心指标变化趋势\n2. 📊 **问题定位**：确定影响业务的关键因素\n3. 💡 **优化建议**：基于行业最佳实践给出可执行方案\n\n如需更具体的分析，请提供更多业务数据。',
    };

    const response = responses[agentId] || responses['default'];

    // 模拟打字效果，逐字发送
    const words = response.split('');
    let index = 0;

    const typing = setInterval(() => {
      if (index < words.length) {
        const chunk = words.slice(index, index + 3).join('');
        socket.emit('message:chunk', {
          conversationId,
          chunk,
          done: false,
        });
        index += 3;
      } else {
        clearInterval(typing);
        socket.emit('message:chunk', {
          conversationId,
          chunk: '',
          done: true,
        });
      }
    }, 30);
  });

  // 用户正在输入
  socket.on('user:typing', (data) => {
    socket.to(`conv:${data.conversationId}`).emit('user:typing', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 客户端断开: ${socket.id}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🔌 WebSocket 服务器运行在 :${PORT}`);
});
