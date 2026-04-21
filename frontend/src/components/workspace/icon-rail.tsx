"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Package, FolderOpen, BookOpen, Play, Home } from "lucide-react";
import { useWorkspace, type PanelView } from "./workspace-provider";

interface RailButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  accent?: boolean;
  pulse?: boolean;
  large?: boolean;
  onClick: () => void;
  label: string;
  shortcut?: string;
  caption?: string;
}

function RailButton({ icon, active, accent, pulse, large, onClick, label, shortcut, caption }: RailButtonProps) {
  const title = shortcut ? `${label} (${shortcut})` : label;

  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={label}
      className={`group relative flex ${large ? "h-12 w-full flex-col gap-0.5" : caption ? "h-10 w-full flex-col gap-0.5" : "h-8 w-8"} items-center justify-center transition-colors duration-150 ${
        accent
          ? "bg-primary text-white hover:bg-primary-hover"
          : active
            ? "bg-bg text-text"
            : "text-text-dim hover:text-text-muted hover:bg-surface-hover"
      }`}
    >
      {icon}
      {caption && (
        <span className={`font-mono text-[9px] uppercase tracking-[0.08em] leading-none select-none ${active ? "text-text" : ""}`}>
          {caption}
        </span>
      )}
      {pulse && (
        <span className="pointer-events-none absolute inset-0 border border-primary animate-runPulse" />
      )}
    </button>
  );
}

export function IconRail() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { panelView, panelOpen, togglePanel, activeSubmodule, getRunHistory } =
    useWorkspace();

  const isActive = (view: PanelView) => panelView === view && panelOpen;

  // Pulse the run button if tests were never run for the active submodule
  const history = activeSubmodule
    ? getRunHistory(activeSubmodule.full_id)
    : undefined;
  const neverRun = !history || history.totalRuns === 0;

  function handleToolbarKeyDown(e: React.KeyboardEvent) {
    const buttons =
      containerRef.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!buttons?.length) return;

    const currentIdx = Array.from(buttons).findIndex(
      (b) => b === document.activeElement
    );
    if (currentIdx < 0) return;

    let nextIdx = currentIdx;
    if (e.key === "ArrowDown") {
      nextIdx = (currentIdx + 1) % buttons.length;
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      nextIdx = (currentIdx - 1 + buttons.length) % buttons.length;
      e.preventDefault();
    } else if (e.key === "Home") {
      nextIdx = 0;
      e.preventDefault();
    } else if (e.key === "End") {
      nextIdx = buttons.length - 1;
      e.preventDefault();
    } else {
      return;
    }

    buttons[nextIdx].focus();
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleToolbarKeyDown}
      className="flex h-full w-14 flex-col items-center gap-0.5 bg-surface border-r border-border py-2"
      role="toolbar"
      aria-label="Workspace toolbar"
    >
      <RailButton
        icon={<Package size={15} strokeWidth={1.5} />}
        active={isActive("modules")}
        onClick={() => togglePanel("modules")}
        label="Módulos"
        caption="modules"
        shortcut="Ctrl+1"
      />
      <RailButton
        icon={<FolderOpen size={15} strokeWidth={1.5} />}
        active={isActive("files")}
        onClick={() => togglePanel("files")}
        label="Archivos"
        caption="files"
        shortcut="Ctrl+2"
      />
      <RailButton
        icon={<BookOpen size={15} strokeWidth={1.5} />}
        active={isActive("resources")}
        onClick={() => togglePanel("resources")}
        label="Recursos"
        caption="docs"
        shortcut="Ctrl+3"
      />
      <div className="flex-1" />
      <div className="w-8 border-t border-border my-1.5" />
      <RailButton
        icon={<Play size={18} strokeWidth={1.75} />}
        accent
        large
        pulse={neverRun}
        onClick={() => window.dispatchEvent(new CustomEvent("buildmancer:run-tests"))}
        label="Ejecutar pruebas"
        caption="run"
        shortcut="Ctrl+Enter"
      />
      <RailButton
        icon={<Home size={15} strokeWidth={1.5} />}
        onClick={() => router.push("/courses")}
        label="Volver a proyectos"
        caption="exit"
      />
    </div>
  );
}
