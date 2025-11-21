import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* 获取用户对话列表 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");

  const conversations = await prisma.conversation.findMany({
    where: {
      userId: session.user.id,
      ...(botId ? { botId } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json(conversations);
}

/* 创建新对话 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { botId } = await request.json();

    const conversation = await prisma.conversation.create({
      data: {
        botId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
