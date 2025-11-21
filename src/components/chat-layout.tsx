"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  Plus,
  Send,
  Loader2,
  MessageSquare,
  Settings,
  LogOut,
  Trash2,
  Bot,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const ALL_MODELS = [
  // OpenAI
  { value: "openai/gpt-5.1", label: "GPT-5.1" },
  { value: "openai/gpt-5.1-codex", label: "GPT-5.1 Codex" },
  { value: "openai/gpt-5-pro", label: "GPT-5 Pro" },
  { value: "openai/gpt-5-codex", label: "GPT-5 Codex" },
  { value: "openai/gpt-5-image", label: "GPT-5 Image" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "openai/gpt-4.1", label: "GPT-4.1" },
  { value: "openai/o4-mini-deep-research", label: "o4 Mini Deep Research" },
  { value: "openai/o3-deep-research", label: "o3 Deep Research" },
  { value: "openai/o3-mini", label: "o3-mini" },
  // Anthropic
  { value: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
  { value: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5" },
  { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku" },
  // Google
  { value: "google/gemini-3-pro-preview", label: "Gemini 3 Pro Preview" },
  { value: "google/gemini-2.5-flash-preview-09-2025", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image" },
  { value: "google/gemini-2.5-flash-lite-preview-09-2025", label: "Gemini 2.5 Flash Lite" },
  // xAI
  { value: "x-ai/grok-4.1-fast", label: "Grok 4.1 Fast" },
  { value: "x-ai/grok-4-fast", label: "Grok 4 Fast" },
  // DeepSeek
  { value: "deepseek/deepseek-v3.2-exp", label: "DeepSeek V3.2" },
  { value: "deepseek/deepseek-v3.1-terminus", label: "DeepSeek V3.1 Terminus" },
  { value: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  // Qwen
  { value: "qwen/qwen3-max", label: "Qwen3 Max" },
  { value: "qwen/qwen3-coder-plus", label: "Qwen3 Coder Plus" },
  { value: "qwen/qwen3-coder-flash", label: "Qwen3 Coder Flash" },
  { value: "qwen/qwen-plus-2025-07-28", label: "Qwen Plus" },
  // Meta
  { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  { value: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick" },
  // Mistral
  { value: "mistralai/mistral-large", label: "Mistral Large" },
  { value: "mistralai/voxtral-small-24b-2507", label: "Voxtral Small 24B" },
  // MiniMax
  { value: "minimax/minimax-m2", label: "MiniMax M2" },
  // Amazon
  { value: "amazon/nova-premier-v1", label: "Amazon Nova Premier" },
  // NVIDIA
  { value: "nvidia/llama-3.3-nemotron-super-49b-v1.5", label: "Nemotron Super 49B" },
  // Perplexity
  { value: "perplexity/sonar-pro-search", label: "Sonar Pro Search" },
  // Moonshot
  { value: "moonshotai/kimi-k2-thinking", label: "Kimi K2 Thinking" },
  // Free models
  { value: "x-ai/grok-4.1-fast:free", label: "Grok 4.1 Fast (Free)" },
  { value: "nvidia/nemotron-nano-9b-v2:free", label: "Nemotron Nano 9B (Free)" },
  { value: "meituan/longcat-flash-chat:free", label: "LongCat Flash (Free)" },
];

const DEFAULT_ENABLED_MODELS = [
  "openai/gpt-4o-mini",
  "anthropic/claude-sonnet-4.5",
  "google/gemini-2.5-flash-preview-09-2025",
  "deepseek/deepseek-chat",
  "qwen/qwen3-max",
];

interface BotData {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  model: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
}

interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
}

interface ChatLayoutProps {
  bots: BotData[];
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function ChatLayout({ bots: initialBots, user }: ChatLayoutProps) {
  const [bots, setBots] = useState(initialBots);
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateBot, setShowCreateBot] = useState(false);
  const [showEditBot, setShowEditBot] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [enabledModels, setEnabledModels] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("enabledModels");
      return saved ? JSON.parse(saved) : DEFAULT_ENABLED_MODELS;
    }
    return DEFAULT_ENABLED_MODELS;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 保存启用的模型到 localStorage
  useEffect(() => {
    localStorage.setItem("enabledModels", JSON.stringify(enabledModels));
  }, [enabledModels]);

  // 过滤出启用的模型
  const MODELS = ALL_MODELS.filter((m) => enabledModels.includes(m.value));

  // 切换模型启用状态
  const toggleModel = (modelValue: string) => {
    setEnabledModels((prev) =>
      prev.includes(modelValue)
        ? prev.filter((v) => v !== modelValue)
        : [...prev, modelValue]
    );
  };

  const [newBot, setNewBot] = useState({
    name: "",
    description: "",
    systemPrompt: "你是一个有帮助的 AI 助手。",
    model: "openai/gpt-4o-mini",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* 选择 Bot */
  const handleSelectBot = async (bot: BotData) => {
    setSelectedBot(bot);
    setSelectedConversation(null);
    setMessages([]);

    try {
      const res = await fetch(`/api/conversations?botId=${bot.id}`);
      const convs = await res.json();
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    }
  };

  /* 选择对话 */
  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    setMessages([]);

    try {
      const res = await fetch(`/api/conversations/${conv.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  /* 创建新对话 */
  const handleNewConversation = async () => {
    if (!selectedBot) return;

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId: selectedBot.id }),
      });

      if (res.ok) {
        const newConv = await res.json();
        setConversations((prev) => [newConv, ...prev]);
        setSelectedConversation(newConv);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  /* 删除对话 */
  const handleDeleteConversation = async (id: string) => {
    if (!confirm("确定要删除这个对话吗？")) return;

    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  /* 发送消息 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !selectedBot || !selectedConversation) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: selectedBot.id,
          conversationId: selectedConversation.id,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("请求失败");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应");

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        content += chunk;

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content } : m))
        );
      }

      // 更新对话标题
      if (messages.length === 0) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, title: userMessage.slice(0, 30) }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "抱歉，发生了错误。请检查 API Key 是否正确配置。" }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* 创建 Bot */
  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBot),
      });

      if (res.ok) {
        const bot = await res.json();
        setBots((prev) => [bot, ...prev]);
        setShowCreateBot(false);
        setNewBot({
          name: "",
          description: "",
          systemPrompt: "你是一个有帮助的 AI 助手。",
          model: "openai/gpt-4o-mini",
        });
        handleSelectBot(bot);
      }
    } catch (error) {
      console.error("Create bot error:", error);
    }
  };

  /* 更新 Bot */
  const handleUpdateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBot) return;

    try {
      const res = await fetch(`/api/bots/${selectedBot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBot),
      });

      if (res.ok) {
        const updatedBot = await res.json();
        setBots((prev) => prev.map((b) => (b.id === updatedBot.id ? updatedBot : b)));
        setSelectedBot(updatedBot);
        setShowEditBot(false);
      }
    } catch (error) {
      console.error("Update bot error:", error);
    }
  };

  /* 删除 Bot */
  const handleDeleteBot = async (id: string) => {
    if (!confirm("确定要删除这个助手吗？")) return;

    try {
      await fetch(`/api/bots/${id}`, { method: "DELETE" });
      setBots((prev) => prev.filter((b) => b.id !== id));
      if (selectedBot?.id === id) {
        setSelectedBot(null);
        setConversations([]);
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Delete bot error:", error);
    }
  };

  /* 更新 Bot 模型 */
  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    if (!selectedBot) return;

    // Optimistic update
    const updatedBot = { ...selectedBot, model };
    setBots((prev) => prev.map((b) => (b.id === updatedBot.id ? updatedBot : b)));
    setSelectedBot(updatedBot);

    try {
      await fetch(`/api/bots/${selectedBot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selectedBot, model }),
      });
    } catch (error) {
      console.error("Update bot model error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-white text-[#0d0d0d] font-sans">
      {/* 左侧：助手列表 */}
      <div className="w-64 bg-[#f9f9f9] border-r border-gray-200 flex flex-col">
        <div className="p-3">
          <Button
            onClick={() => setShowCreateBot(true)}
            variant="outline"
            className="w-full justify-start gap-2 bg-white hover:bg-gray-50 border-gray-200"
          >
            <Plus className="h-4 w-4" />
            新建助手
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">

          {bots.map((bot) => (
            <div
              key={bot.id}
              className={`group flex items-center gap-2 px-3 h-10 py-0 rounded-lg cursor-pointer mb-1 transition-colors ${selectedBot?.id === bot.id
                ? "bg-[#ececec] text-black font-medium"
                : "hover:bg-[#ececec] text-gray-600"
                }`}
              onClick={() => handleSelectBot(bot)}
            >
              <Bot className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-sm">{bot.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewBot({
                    name: bot.name,
                    description: bot.description || "",
                    systemPrompt: bot.systemPrompt,
                    model: bot.model,
                  });
                  setSelectedBot(bot);
                  setShowEditBot(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-gray-600 transition-opacity"
              >
                <Settings className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBot(bot.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {bots.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              还没有助手
            </div>
          )}
        </div>

        {/* 用户菜单 */}
        <div className="border-t border-gray-200 p-3">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ececec] transition-colors"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm text-gray-700 font-medium">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>
              <span className="flex-1 text-left text-sm truncate text-gray-700 font-medium">
                {user.name || user.email}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={() => {
                    setShowModelSettings(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <Settings className="h-4 w-4" />
                  模型设置
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 中间：对话列表 */}
      {selectedBot && (
        <div className="w-64 bg-[#f9f9f9] border-r border-gray-200 flex flex-col">
          <div className="p-3">
            <Button
              onClick={handleNewConversation}
              variant="outline"
              className="w-full justify-start gap-2 bg-white hover:bg-gray-50 border-gray-200"
            >
              <Plus className="h-4 w-4" />
              新建对话
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 h-10 py-0 rounded-lg cursor-pointer mb-1 transition-colors ${selectedConversation?.id === conv.id
                  ? "bg-[#ececec] text-black font-medium"
                  : "hover:bg-[#ececec] text-gray-600"
                  }`}
                onClick={() => handleSelectConversation(conv)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-sm">
                  {conv.title || "新对话"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                还没有对话
                <br />
                点击上方按钮创建
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200/50 bg-[#f9f9f9]">
            <div className="flex items-center justify-center h-12 px-3 gap-1">
              <span className="text-xs text-gray-500 shrink-0">模型:</span>
              <Select
                value={selectedBot.model}
                onChange={handleModelChange}
                className="w-auto h-auto border-none shadow-none bg-transparent py-0 pl-1 pr-2 text-xs text-gray-500 focus-visible:ring-0 cursor-pointer"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* 右侧：聊天区域 */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedBot && selectedConversation ? (
          <>
            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">开始和 {selectedBot.name} 对话吧</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                      {/* Assistant Avatar */}
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}

                      {/* Message Content */}
                      <div
                        className={`max-w-[85%] ${message.role === "user"
                          ? "bg-[#f4f4f4] text-gray-900 rounded-[24px] px-5 py-2.5"
                          : "text-gray-900 px-1 py-1"
                          }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {message.content || "..."}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="p-4 bg-white">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="relative bg-[#f4f4f4] rounded-[26px] shadow-sm focus-within:ring-1 focus-within:ring-gray-200 focus-within:bg-white transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="给 MyAgents 发送消息"
                    className="w-full bg-transparent border-none text-gray-900 placeholder:text-gray-500 px-4 pt-[18px] pb-[14px] pr-12 min-h-[52px] max-h-40 resize-none focus:outline-none focus:ring-0 shadow-none rounded-[26px] text-sm"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-3 flex items-center gap-1">
                    <Button
                      type="submit"
                      disabled={loading || !input.trim()}
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black hover:bg-gray-800 text-white disabled:opacity-30 disabled:bg-black"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-400">
                    MyAgents 可能会犯错。请核实重要信息。
                  </p>
                </div>
              </form>
            </div>
          </>
        ) : selectedBot ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <p>选择一个对话或创建新对话</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Bot className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">MyAgents</h2>
            <p className="text-gray-500">选择一个助手开始对话</p>
          </div>
        )}
      </div>

      {/* 创建 Bot 弹窗 */}
      {showCreateBot && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">创建新助手</h3>
            <form onSubmit={handleCreateBot} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">名称 *</Label>
                <Input
                  id="name"
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  placeholder="我的 AI 助手"
                  required
                  className="bg-white border-gray-300 focus:border-black focus:ring-black rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-medium">描述</Label>
                <Input
                  id="description"
                  value={newBot.description}
                  onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
                  placeholder="这个助手可以帮助..."
                  className="bg-white border-gray-300 focus:border-black focus:ring-black rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-gray-700 font-medium">模型</Label>
                <Select
                  id="model"
                  value={newBot.model}
                  onChange={(e) => setNewBot({ ...newBot, model: e.target.value })}
                  className="bg-white border-gray-300 focus:border-black focus:ring-black rounded-lg"
                >
                  {MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt" className="text-gray-700 font-medium">系统提示词</Label>
                <Textarea
                  id="systemPrompt"
                  value={newBot.systemPrompt}
                  onChange={(e) => setNewBot({ ...newBot, systemPrompt: e.target.value })}
                  placeholder="你是一个..."
                  rows={4}
                  className="bg-white border-gray-300 focus:border-black focus:ring-black rounded-lg"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateBot(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  取消
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white rounded-lg">创建</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑 Bot 弹窗 */}
      {showEditBot && selectedBot && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">编辑助手</h3>
            <form onSubmit={handleUpdateBot} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-gray-700 font-medium">名称 *</Label>
                <Input
                  id="edit-name"
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  required
                  className="bg-white border-gray-300 focus:border-black focus:ring-black rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-gray-700 font-medium">描述</Label>
                <Input
                  id="edit-description"
                  value={newBot.description}
                  onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
                  className="bg-white border-gray-300 focus:border-black focus:ring-black rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-model" className="text-gray-700 font-medium">模型</Label>
                <Select
                  id="edit-model"
                  value={newBot.model}
                  onChange={(e) => setNewBot({ ...newBot, model: e.target.value })}
                  className="bg-white border-gray-300 focus:border-black focus:ring-black rounded-lg"
                >
                  {MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-systemPrompt" className="text-gray-700 font-medium">系统提示词</Label>
                <Textarea
                  id="edit-systemPrompt"
                  value={newBot.systemPrompt}
                  onChange={(e) => setNewBot({ ...newBot, systemPrompt: e.target.value })}
                  rows={4}
                  className="bg-white border-gray-300 focus:border-black focus:ring-black rounded-lg"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditBot(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  取消
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white rounded-lg">保存</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模型设置弹窗 */}
      {showModelSettings && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">模型设置</h3>
            <p className="text-sm text-gray-500 mb-4">选择要在下拉菜单中显示的模型</p>

            <div className="space-y-1 max-h-80 overflow-y-auto">
              {ALL_MODELS.map((model) => (
                <button
                  key={model.value}
                  onClick={() => toggleModel(model.value)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      enabledModels.includes(model.value)
                        ? "bg-black border-black"
                        : "border-gray-300"
                    }`}
                  >
                    {enabledModels.includes(model.value) && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{model.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModelSettings(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
