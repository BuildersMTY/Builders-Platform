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
      className={`relative flex ${large ? "h-14 w-full flex-col gap-1" : caption ? "h-11 w-full flex-col gap-0.5" : "h-9 w-9"} items-center justify-center rounded-lg transition-colors duration-150 ${
        accent
          ? "bg-primary text-white hover:bg-primary-hover"
          : active
            ? "bg-primary-subtle text-text"
            : "text-text-dim hover:text-text-muted hover:bg-surface-hover"
      }`}
    >
      {icon}
      {caption && (
        <span className={`text-[10px] leading-none text-center select-none ${active ? "text-text-muted" : ""}`}>{caption}</span>
      )}
      {pulse && (
        <span className="absolute inset-0 rounded-lg border-2 border-primary animate-runPulse" />
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
      className="flex h-full w-16 flex-col items-center gap-1.5 bg-surface border-r border-border px-1.5 py-4"
      role="toolbar"
      aria-label="Workspace toolbar"
    >
      <RailButton
        icon={<Package size={17} />}
        active={isActive("modules")}
        onClick={() => togglePanel("modules")}
        label="Módulos"
        caption="Módulos"
        shortcut="Ctrl+1"
      />
      <RailButton
        icon={<FolderOpen size={17} />}
        active={isActive("files")}
        onClick={() => togglePanel("files")}
        label="Archivos"
        caption="Archivos"
        shortcut="Ctrl+2"
      />
      <RailButton
        icon={<BookOpen size={17} />}
        active={isActive("resources")}
        onClick={() => togglePanel("resources")}
        label="Recursos"
        caption="Recursos"
        shortcut="Ctrl+3"
      />
      <div className="flex-1" />
      <div className="w-8 border-t border-border mb-2" />
      <RailButton
        icon={<Play size={20} />}
        accent
        large
        pulse={neverRun}
        onClick={() => window.dispatchEvent(new CustomEvent("buildmancer:run-tests"))}
        label="Ejecutar pruebas"
        caption="Ejecutar"
        shortcut="Ctrl+Enter"
      />
      <RailButton
        icon={<Home size={17} />}
        onClick={() => router.push("/courses")}
        label="Volver a proyectos"
        caption="Inicio"
      />
    </div>
  );
}
