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
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-bg/95 backdrop-blur-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/builderslogo2.svg" alt="Buildmancer" width={32} height={32} />
          <span className="text-lg font-bold">Buildmancer</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#como-funciona" className="text-sm text-text-muted hover:text-text transition-colors">
            Cómo funciona
          </a>
          <a href="#proyectos" className="text-sm text-text-muted hover:text-text transition-colors">
            Proyectos
          </a>
          <Link href="/pricing" className="text-sm text-text-muted hover:text-text transition-colors">
            Precios
          </Link>
        </div>

        <div className="hidden md:block">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors duration-150"
          >
            Comenzar
          </Link>
        </div>

        <button
          className="md:hidden text-text-muted hover:text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-bg px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#como-funciona" className="text-sm text-text-muted hover:text-text" onClick={() => setMobileOpen(false)}>
              Cómo funciona
            </a>
            <a href="#proyectos" className="text-sm text-text-muted hover:text-text" onClick={() => setMobileOpen(false)}>
              Proyectos
            </a>
            <Link href="/pricing" className="text-sm text-text-muted hover:text-text" onClick={() => setMobileOpen(false)}>
              Precios
            </Link>
            <Link
              href="/courses"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors duration-150"
            >
              Comenzar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
