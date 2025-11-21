/* OpenRouter API 封装 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}

/* 调用 OpenRouter API */
export async function chat(options: ChatOptions) {
  const { model, messages, stream = false } = options;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  return response;
}

/* 流式聊天 */
export async function streamChat(options: ChatOptions) {
  return chat({ ...options, stream: true });
}
