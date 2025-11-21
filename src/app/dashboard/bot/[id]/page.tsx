import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditBotForm } from "@/components/edit-bot-form";

interface EditBotPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBotPage({ params }: EditBotPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const bot = await prisma.bot.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!bot) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">编辑助手</h1>
        <EditBotForm bot={bot} />
      </div>
    </div>
  );
}
