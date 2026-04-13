"use client";

import { useRouter } from "next/navigation";
import { Package, FolderOpen, BookOpen, Play, Home } from "lucide-react";
import Image from "next/image";
import { useWorkspace, type PanelView } from "./workspace-provider";

interface RailButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  accent?: boolean;
  onClick: () => void;
  title: string;
}

function RailButton({ icon, active, accent, onClick, title }: RailButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ${
        accent
          ? "bg-primary text-white hover:bg-primary-hover"
          : active
            ? "bg-surface-hover text-text border-l-2 border-primary"
            : "text-text-dim hover:text-text-muted hover:bg-surface-hover"
      }`}
    >
      {icon}
    </button>
  );
}

export function IconRail() {
  const router = useRouter();
  const { panelView, panelOpen, togglePanel } = useWorkspace();

  const isActive = (view: PanelView) => panelView === view && panelOpen;

  return (
    <div className="flex h-full w-12 flex-col items-center gap-1.5 bg-surface border-r border-border py-3">
      <div className="mb-2">
        <Image src="/builderslogo2.svg" alt="B" width={26} height={26} />
      </div>
      <RailButton icon={<Package size={18} />} active={isActive("modules")} onClick={() => togglePanel("modules")} title="Módulos" />
      <RailButton icon={<FolderOpen size={18} />} active={isActive("files")} onClick={() => togglePanel("files")} title="Archivos" />
      <RailButton icon={<BookOpen size={18} />} active={isActive("resources")} onClick={() => togglePanel("resources")} title="Recursos" />
      <div className="flex-1" />
      <RailButton
        icon={<Play size={18} />}
        accent
        onClick={() => window.dispatchEvent(new CustomEvent("buildmancer:run-tests"))}
        title="Ejecutar pruebas"
      />
      <RailButton icon={<Home size={18} />} onClick={() => router.push("/courses")} title="Volver a proyectos" />
    </div>
  );
}
