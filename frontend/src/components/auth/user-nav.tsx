"use client";

import { useAuth } from "./auth-provider";
import { sharkAuth } from "@/lib/shark-auth";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, refresh } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await sharkAuth.logout();
    } catch {
      // ignore
    }
    await refresh();
    router.replace("/login");
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-text-muted hidden sm:inline">
        {user.name || user.email}
      </span>
      <button
        onClick={handleLogout}
        className="text-[10px] font-black uppercase tracking-wider border-2 border-text px-2 py-1 hover:bg-text hover:text-background transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
