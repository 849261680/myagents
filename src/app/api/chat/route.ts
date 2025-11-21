import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamChat, ChatMessage } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("未登录", { status: 401 });
  }

  try {
    const { botId, messages, conversationId } = await request.json();

    // 获取 Bot 信息
    const bot = await prisma.bot.findFirst({
      where: { id: botId, userId: session.user.id },
    });

    if (!bot) {
      return new Response("Bot 不存在", { status: 404 });
    }

    // 构建消息列表
    const chatMessages: ChatMessage[] = [
      { role: "system", content: bot.systemPrompt },
      ...messages,
    ];

    // 调用 OpenRouter API
    const response = await streamChat({
      model: bot.model,
      messages: chatMessages,
    });

    // 创建 ReadableStream 转发响应
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // 忽略解析错误
                }
              }
            }
          }

          // 保存对话历史
          if (conversationId && fullContent) {
            const lastUserMessage = messages[messages.length - 1];

            await prisma.message.createMany({
              data: [
                {
                  role: "user",
                  content: lastUserMessage.content,
                  conversationId,
                },
                {
                  role: "assistant",
                  content: fullContent,
                  conversationId,
                },
              ],
            });

            // 更新对话标题（如果是第一条消息）
            const conversation = await prisma.conversation.findUnique({
              where: { id: conversationId },
              include: { messages: true },
            });

            if (conversation && conversation.messages.length <= 2 && !conversation.title) {
              await prisma.conversation.update({
                where: { id: conversationId },
                data: { title: lastUserMessage.content.slice(0, 50) },
              });
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("聊天失败", { status: 500 });
  }
}
