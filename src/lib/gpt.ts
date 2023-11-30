import type { ChatMessage } from "@/types";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function chat(messageList: ChatMessage[]) {
  try {
    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "post",
      // signal: AbortSignal.timeout(8000),  // 开启后到达设定时间会中断流式输出
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: messageList,
      }),
    });
    return result;
  } catch (error) {
    throw error;
  }
}