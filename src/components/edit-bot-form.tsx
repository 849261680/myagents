"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODELS = [
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku" },
  { value: "google/gemini-pro-1.5", label: "Gemini Pro 1.5" },
  { value: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
  { value: "mistralai/mistral-large", label: "Mistral Large" },
  { value: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
];

interface EditBotFormProps {
  bot: {
    id: string;
    name: string;
    description: string | null;
    systemPrompt: string;
    model: string;
  };
}

export function EditBotForm({ bot }: EditBotFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: bot.name,
    description: bot.description || "",
    systemPrompt: bot.systemPrompt,
    model: bot.model,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/bots/${bot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>助手设置</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名称 *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">模型</Label>
            <Select
              id="model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">系统提示词</Label>
            <Textarea
              id="systemPrompt"
              value={form.systemPrompt}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              rows={6}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
