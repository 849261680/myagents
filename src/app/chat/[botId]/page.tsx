import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatInterface } from "@/components/chat-interface";

interface ChatPageProps {
  params: Promise<{ botId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();
  const { botId } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const bot = await prisma.bot.findFirst({
    where: { id: botId, userId: session.user.id },
  });

  if (!bot) {
    redirect("/dashboard");
  }

  // 获取或创建对话
  let conversation = await prisma.conversation.findFirst({
    where: { botId, userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        botId,
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
    });
  }

  return (
    <ChatInterface
      bot={bot}
      conversation={conversation}
      initialMessages={conversation.messages}
    />
  );
}
