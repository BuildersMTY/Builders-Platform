"use client";

import { useState, useCallback, useEffect } from "react";
import { BookOpen } from "lucide-react";
import {
  useWorkspace,
  getResourceStage,
  isResourceVisible,
} from "./workspace-provider";
import { ModuleList } from "./module-list";
import { FileTree } from "./file-tree";
import { ResizeHandle } from "./resize-handle";

const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 180;
const MAX_WIDTH = 400;

function getInitialWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const stored = localStorage.getItem("buildmancer:sidebar-width");
  if (stored) {
    const n = parseInt(stored, 10);
    if (n >= MIN_WIDTH && n <= MAX_WIDTH) return n;
  }
  return DEFAULT_WIDTH;
}

export function Panel() {
  const { panelView, panelOpen } = useWorkspace();
  const [width, setWidth] = useState(getInitialWidth);

  const handleResize = useCallback(
    (delta: number) => {
      setWidth((w) => {
        const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w + delta));
        return next;
      });
    },
    []
  );

  const handleResizeEnd = useCallback(() => {
    // Persist after drag ends
    setWidth((w) => {
      localStorage.setItem("buildmancer:sidebar-width", String(w));
      return w;
    });
  }, []);

  if (!panelOpen || !panelView) return null;

  return (
    <>
      <div
        className="h-full flex-shrink-0 overflow-y-auto border-r border-border bg-surface shadow-[2px_0_12px_rgba(0,0,0,0.25)] transition-none"
        style={{ width: `${width}px` }}
      >
        {panelView === "modules" && <ModuleList />}
        {panelView === "files" && <FileTree />}
        {panelView === "resources" && <StagedResourceList />}
      </div>
      <ResizeHandle
        direction="horizontal"
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
      />
    </>
  );
}

function StagedResourceList() {
  const { activeSubmodule, openResourceTab, getRunHistory } = useWorkspace();

  if (!activeSubmodule) {
    return (
      <div className="p-4">
        <p className="text-xs text-text-dim">Selecciona un submódulo primero.</p>
      </div>
    );
  }

  const resources = activeSubmodule.resources;
  const history = getRunHistory(activeSubmodule.full_id);

  const visible = resources.filter((r) =>
    isResourceVisible(getResourceStage(r.type), history)
  );
  const locked = resources.filter(
    (r) => !isResourceVisible(getResourceStage(r.type), history)
  );

  return (
    <div className="p-4">
      <h4 className="text-base tracking-tight">
        <span className="font-serif italic text-primary">Recursos</span>
      </h4>

      <div className="mt-3 flex flex-col gap-1">
        {visible.length === 0 && locked.length === 0 && (
          <p className="text-xs text-text-dim">Sin recursos para este submódulo.</p>
        )}

        {visible.map((r) => (
          <button
            key={r.file}
            onClick={() => openResourceTab(r.file, r.title)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
          >
            <BookOpen size={12} className="flex-shrink-0 text-warning/60" />
            <span className="truncate">{r.title}</span>
          </button>
        ))}

        {locked.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            {locked.map((r) => {
              const stage = getResourceStage(r.type);
              const hint =
                stage === 1
                  ? "Disponible después de ejecutar las pruebas"
                  : stage === 2
                    ? "Disponible si necesitas ayuda"
                    : "Bloqueado";
              return (
                <div
                  key={r.file}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-text-dim/50"
                  title={hint}
                >
                  <BookOpen size={12} className="flex-shrink-0" />
                  <span className="truncate">{r.title}</span>
                  <span className="ml-auto text-[10px] flex-shrink-0 opacity-40">bloqueado</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
