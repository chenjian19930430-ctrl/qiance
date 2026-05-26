import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

export const aiModel = openai('gpt-4o-mini');

export async function generateAIResponse(prompt: string, systemPrompt?: string) {
  const result = await generateText({
    model: aiModel,
    system: systemPrompt || '你是一个专业的电商AI助手，帮助用户分析数据、提供建议。',
    prompt,
  });
  return result.text;
}

export function streamAIResponse(prompt: string, systemPrompt?: string) {
  return streamText({
    model: aiModel,
    system: systemPrompt || '你是一个专业的电商AI助手，帮助用户分析数据、提供建议。',
    prompt,
  });
}

// MiniMax API 封装（用于视频生成等）
export async function generateWithMiniMax(prompt: string) {
  const apiKey = process.env.MINIMAX_API_KEY;
  const groupId = process.env.MINIMAX_GROUP_ID;

  if (!apiKey || !groupId) {
    throw new Error('MiniMax API未配置');
  }

  const response = await fetch(`https://api.minimax.chat/v1/text/chatcompletion_v2?GroupId=${groupId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-Text-01',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
