import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* 获取单个 Bot */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const bot = await prisma.bot.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!bot) {
    return NextResponse.json({ error: "Bot 不存在" }, { status: 404 });
  }

  return NextResponse.json(bot);
}

/* 更新 Bot */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { name, description, systemPrompt, model } = await request.json();

    const bot = await prisma.bot.updateMany({
      where: { id, userId: session.user.id },
      data: { name, description, systemPrompt, model },
    });

    if (bot.count === 0) {
      return NextResponse.json({ error: "Bot 不存在" }, { status: 404 });
    }

    const updatedBot = await prisma.bot.findUnique({ where: { id } });
    return NextResponse.json(updatedBot);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

/* 删除 Bot */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const bot = await prisma.bot.deleteMany({
      where: { id, userId: session.user.id },
    });

    if (bot.count === 0) {
      return NextResponse.json({ error: "Bot 不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
