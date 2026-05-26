'use client';

import { useState } from 'react';
import { Bot, Send, BotMessageSquare } from 'lucide-react';

const agents = [
  { id: 'all', name: '全部智能体' },
  { id: 'product', name: '商品管理助手' },
  { id: 'ads', name: '投流策略官' },
  { id: 'finance', name: '财务记账助手' },
  { id: 'tax', name: '税务申报助手' },
];

const welcomeMessage = {
  role: 'assistant',
  content: '你好！我是千策AI助手，我可以帮你管理商品、优化投放策略、处理财务税务等工作。请选择上方智能体或直接输入你的问题。',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agentId?: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input, agentId: selectedAgent };
    const reply: Message = {
      role: 'assistant',
      content: `已收到你的消息，正在由${agents.find(a => a.id === selectedAgent)?.name || '全部智能体'}处理中...`,
    };
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI对话</h1>
        <p className="text-muted-foreground text-sm mt-1">与智能体对话，获取即时帮助</p>
      </div>

      <div className="bg-white rounded-xl border border-border flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
        {/* Top bar - Agent Selector */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <Bot className="w-5 h-5 text-muted-foreground" />
          <div className="flex gap-2 flex-wrap">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  selectedAgent === agent.id
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {agent.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BotMessageSquare className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="border-t border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
