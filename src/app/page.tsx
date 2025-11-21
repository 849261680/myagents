import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4">MyAgents</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          创建和管理你的个性化 AI 聊天助手
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            注册
          </Link>
        </div>
      </main>
    </div>
  );
}
