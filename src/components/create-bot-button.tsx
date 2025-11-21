"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

// OpenRouter 常用模型列表
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

export function CreateBotButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    systemPrompt: "你是一个有帮助的 AI 助手。",
    model: "openai/gpt-4o-mini",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setOpen(false);
        setForm({
          name: "",
          description: "",
          systemPrompt: "你是一个有帮助的 AI 助手。",
          model: "openai/gpt-4o-mini",
        });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        创建助手
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-950 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">创建新助手</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名称 *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="我的 AI 助手"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="这个助手可以帮助..."
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
              placeholder="你是一个..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "创建中..." : "创建"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
