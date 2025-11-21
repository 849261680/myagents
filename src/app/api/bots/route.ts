import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* 获取用户的所有 Bot */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const bots = await prisma.bot.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bots);
}

/* 创建新 Bot */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { name, description, systemPrompt, model } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "名称是必填项" }, { status: 400 });
    }

    const bot = await prisma.bot.create({
      data: {
        name,
        description: description || "",
        systemPrompt: systemPrompt || "You are a helpful assistant.",
        model: model || "openai/gpt-4o-mini",
        userId: session.user.id,
      },
    });

    return NextResponse.json(bot);
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
