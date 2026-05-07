"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sharkAuth } from "@/lib/shark-auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await sharkAuth.login(email, password);
      router.replace("/courses");
    } catch (err: any) {
      setError(err?.message || "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
        Login
      </h1>
      <p className="text-sm text-text-muted mb-6 font-bold">
        Continue building with Buildmancer.
      </p>

      {error && (
        <div className="mb-4 border-2 border-red-500 bg-red-500/10 p-3 text-xs font-bold text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-[0.14em] text-text-dim mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-text bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-[0.14em] text-text-dim mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-text bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-black uppercase tracking-wider py-3 text-sm hover:bg-primary/90 disabled:opacity-50 transition-opacity"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-muted font-bold">
        No account?{" "}
        <Link href="/signup" className="text-primary underline hover:text-primary/80">
          Sign up
        </Link>
      </p>
    </div>
  );
}
