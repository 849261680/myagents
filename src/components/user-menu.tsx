"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {user.name || user.email}
      </span>
      <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        <LogOut className="h-4 w-4 mr-2" />
        退出
      </Button>
    </div>
  );
}
