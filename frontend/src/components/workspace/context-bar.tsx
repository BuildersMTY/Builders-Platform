"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import Image from "next/image";
import Link from "next/link";

export function ContextBar() {
  const { course, activeModule, activeSubmodule, passedSubmodules } =
    useWorkspace();

  const totalSubmodules =
    course?.modules.reduce((acc, m) => acc + m.submodules.length, 0) ?? 0;
  const completedCount = passedSubmodules.size;
  const progressPct =
    totalSubmodules > 0 ? (completedCount / totalSubmodules) * 100 : 0;

  return (
    <div className="flex h-10 items-center gap-3 border-b border-border bg-surface px-4">
      {/* Logo — clickable home */}
      <Link
        href="/courses"
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Volver a proyectos"
      >
        <Image
          src="/builderslogo2.svg"
          alt="Buildmancer"
          width={18}
          height={18}
        />
      </Link>

      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 min-w-0 text-xs tracking-tight"
        aria-label="Breadcrumb"
      >
        <span className="text-text-dim truncate max-w-[160px]">
          {course?.meta.title ?? "..."}
        </span>
        {activeModule && (
          <>
            <span className="text-text-dim/40">/</span>
            <span className="text-text-muted truncate max-w-[140px]">
              {activeModule.title}
            </span>
          </>
        )}
        {activeSubmodule && (
          <>
            <span className="text-text-dim/40">/</span>
            <span className="font-semibold text-text truncate max-w-[180px]">
              {activeSubmodule.title}
            </span>
          </>
        )}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Progress pill */}
      {totalSubmodules > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] tabular-nums text-text-dim">
            {completedCount}/{totalSubmodules}
          </span>
          <div className="w-16 h-1 rounded-full bg-surface-hover overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Command palette trigger */}
      <kbd className="hidden lg:inline rounded border border-border px-1.5 py-0.5 text-[10px] text-text-dim flex-shrink-0 cursor-pointer hover:border-text-dim hover:text-text-muted transition-colors"
           onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
      >
        Ctrl+K
      </kbd>

      {/* Keyboard shortcut reference */}
      <ShortcutHelp />

      {/* Shortcut hint — ephemeral, disappears after localStorage flag */}
      <ShortcutHint />
    </div>
  );
}

const SHORTCUTS = [
  { keys: "Ctrl+Enter", desc: "Ejecutar pruebas" },
  { keys: "Ctrl+S", desc: "Guardar" },
  { keys: "Ctrl+K", desc: "Buscar" },
  { keys: "Ctrl+B", desc: "Panel lateral" },
  { keys: "Ctrl+J", desc: "Panel de pruebas" },
  { keys: "Ctrl+W", desc: "Cerrar pestaña" },
  { keys: "Escape", desc: "Cerrar panel" },
] as const;

function ShortcutHelp() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [open, close]);

  return (
    <div ref={ref} className="relative flex-shrink-0 hidden lg:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-5 w-5 items-center justify-center rounded text-text-dim hover:text-text-muted hover:bg-surface-hover transition-colors"
        aria-label="Atajos de teclado"
        title="Atajos de teclado"
      >
        <HelpCircle size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-56 rounded-lg border border-border bg-surface shadow-lg p-3">
          <p className="text-[10px] font-medium text-text-muted mb-2 uppercase tracking-wide">
            Atajos de teclado
          </p>
          <div className="flex flex-col gap-1.5">
            {SHORTCUTS.map(({ keys, desc }) => (
              <div key={keys} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-text-dim">{desc}</span>
                <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-text-muted bg-surface-hover flex-shrink-0">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShortcutHint() {
  const [visible, setVisible] = useState(false);
  const [mod, setMod] = useState("Ctrl");

  useEffect(() => {
    const seen = parseInt(
      localStorage.getItem("buildmancer:shortcut-hint-seen") ?? "0",
      10
    );
    if (seen >= 3) return;

    if (!sessionStorage.getItem("buildmancer:hint-counted")) {
      sessionStorage.setItem("buildmancer:hint-counted", "1");
      localStorage.setItem("buildmancer:shortcut-hint-seen", String(seen + 1));
    }

    if (/(Mac|iPhone|iPad)/.test(navigator.userAgent)) {
      setMod("⌘");
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <span className="text-[10px] text-text-dim flex-shrink-0 hidden lg:inline">
      {mod}+Enter para ejecutar
    </span>
  );
}
