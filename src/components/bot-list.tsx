"use client";

import Link from "next/link";
import { Bot, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface BotData {
  id: string;
  name: string;
  description: string | null;
  model: string;
  createdAt: Date;
}

interface BotListProps {
  bots: BotData[];
}

export function BotList({ bots }: BotListProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个助手吗？")) return;

    await fetch(`/api/bots/${id}`, { method: "DELETE" });
    router.refresh();
  };

  if (bots.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          还没有创建任何助手，点击上方按钮创建一个吧！
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bots.map((bot) => (
        <Card key={bot.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{bot.name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {bot.model.split("/")[1] || bot.model}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={() => handleDelete(bot.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bot.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {bot.description}
              </p>
            )}
            <div className="flex gap-2">
              <Link href={`/chat/${bot.id}`} className="flex-1">
                <Button className="w-full" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  开始对话
                </Button>
              </Link>
              <Link href={`/dashboard/bot/${bot.id}`}>
                <Button variant="outline" size="sm">
                  编辑
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
