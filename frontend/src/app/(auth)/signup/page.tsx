"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sharkAuth } from "@/lib/shark-auth";
import Link from "next/link";
import Image from "next/image";

function AuthShell({
  children,
  headline,
  headlineAccent,
  subline,
}: {
  children: React.ReactNode;
  headline: string;
  headlineAccent: string;
  subline: string;
}) {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Left: Editorial */}
      <div className="hidden md:flex md:w-[58%] flex-col justify-center px-[8vw] relative overflow-hidden">
        <div
          className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] pointer-events-none z-0 animate-ambient"
          style={{
            background:
              "radial-gradient(circle, var(--primary-dim) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-text-dim mb-8">
            Buildmancer — Member Access
          </p>
          <h1
            className="font-serif italic text-text m-0"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
            }}
          >
            {headline}{" "}
            <span className="text-primary">{headlineAccent}</span>
          </h1>
          <p className="font-sans text-[15px] leading-relaxed text-text-muted mt-6 max-w-[420px]">
            {subline}
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-dim">
              Members only
            </span>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col bg-surface border-l border-border relative">
        {/* Mobile header */}
        <div className="md:hidden px-8 pt-12 pb-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-dim mb-4">
            Buildmancer — Member Access
          </p>
          <h1
            className="font-serif italic text-text m-0"
            style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.01em" }}
          >
            {headline}{" "}
            <span className="text-primary">{headlineAccent}</span>
          </h1>
        </div>

        {/* Form — centered vertically and horizontally */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-12">
          <div className="w-full max-w-[360px]">{children}</div>
        </div>

        {/* Powered by Shark */}
        <div className="px-8 md:px-12 pb-8 pt-4 flex items-center gap-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-text-faint">
            Powered by
          </span>
          <Image
            src="/sharky-glyph.png"
            alt="Shark"
            width={16}
            height={16}
            className="opacity-60"
          />
          <Image
            src="/sharky-wordmark.png"
            alt="Shark"
            width={48}
            height={11}
            className="opacity-60"
          />
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await sharkAuth.signup(email, password, { name });
      router.replace("/courses");
    } catch (err: any) {
      setError(err?.message || "Signup failed. Try a different email.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      headline="Join the"
      headlineAccent="club."
      subline="We build real systems here: HTTP servers, databases, protocols. No tutorials. Just shipping."
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-dim mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className={`w-full bg-bg text-text px-3.5 py-2.5 font-sans text-sm border-2 outline-none transition-colors ${
              error ? "border-error" : "border-border-strong focus:border-primary"
            }`}
            style={{ borderRadius: 0 }}
          />
        </div>

        <div className="mb-6">
          <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-dim mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full bg-bg text-text px-3.5 py-2.5 font-sans text-sm border-2 outline-none transition-colors ${
              error ? "border-error" : "border-border-strong focus:border-primary"
            }`}
            style={{ borderRadius: 0 }}
          />
        </div>

        <div className="mb-2">
          <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-dim mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`w-full bg-bg text-text px-3.5 py-2.5 font-sans text-sm border-2 outline-none transition-colors ${
              error ? "border-error" : "border-border-strong focus:border-primary"
            }`}
            style={{ borderRadius: 0 }}
          />
        </div>

        {error && (
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-error mb-4 min-h-[14px]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-text py-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] border-none outline-none transition-colors cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: isLoading ? "var(--primary-dim)" : "var(--primary)",
            borderRadius: 0,
            marginTop: error ? 0 : 24,
            boxShadow: isLoading ? "none" : "0 0 18px var(--primary-glow)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.background = "var(--primary-hover)";
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.background = "var(--primary)";
          }}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-6 text-center font-sans text-xs text-text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-text no-underline border-b border-border-strong transition-colors hover:border-primary"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
