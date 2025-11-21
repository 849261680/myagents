import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatLayout } from "@/components/chat-layout";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const bots = await prisma.bot.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <ChatLayout bots={bots} user={session.user} />;
}
