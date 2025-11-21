import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyAgents - 自定义 AI 助手",
  description: "创建和管理你的个性化 AI 聊天助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
