"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-bg shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/builderslogo2.svg"
            alt="Buildmancer"
            width={28}
            height={28}
          />
          <span className="text-sm font-semibold tracking-tight">
            Buildmancer
          </span>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          <a
            href="#como-funciona"
            className="text-[13px] font-medium text-text-dim transition-colors hover:text-primary"
          >
            Metodología
          </a>
          <a
            href="#proyectos"
            className="text-[13px] font-medium text-text-dim transition-colors hover:text-primary"
          >
            Proyectos
          </a>
          <Link
            href="/pricing"
            className="text-[13px] font-medium text-text-dim transition-colors hover:text-primary"
          >
            Precios
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-9 items-center justify-center rounded-sm border border-primary bg-primary/5 px-5 text-[12px] font-bold text-primary transition-all hover:bg-primary hover:text-bg"
          >
            Comenzar
          </Link>
        </div>

        <button
          className="text-text-muted hover:text-text md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-bg px-6 py-8 md:hidden">
          <div className="flex flex-col gap-6">
            <a
              href="#como-funciona"
              className="text-[15px] font-medium text-text-dim hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Metodología
            </a>
            <a
              href="#proyectos"
              className="text-[15px] font-medium text-text-dim hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Proyectos
            </a>
            <Link
              href="/pricing"
              className="text-[15px] font-medium text-text-dim hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Precios
            </Link>
            <Link
              href="/courses"
              className="inline-flex h-11 items-center justify-center rounded-sm border border-primary bg-primary/5 px-4 text-[14px] font-bold text-primary transition-all active:bg-primary active:text-bg"
              onClick={() => setMobileOpen(false)}
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
