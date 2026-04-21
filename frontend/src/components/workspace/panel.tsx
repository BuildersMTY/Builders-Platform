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
        className="h-full flex-shrink-0 overflow-y-auto border-r border-border bg-surface transition-none"
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
    <div className="flex flex-col">
      <div className="flex h-7 items-center border-b border-border px-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
          resources
        </span>
      </div>

      <div className="flex flex-col py-1">
        {visible.length === 0 && locked.length === 0 && (
          <p className="px-3 py-2 text-[11px] text-text-dim">Sin recursos para este submódulo.</p>
        )}

        {visible.map((r) => (
          <button
            key={r.file}
            onClick={() => openResourceTab(r.file, r.title)}
            className="flex items-center gap-2 px-3 py-1 text-left text-[12px] text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
          >
            <BookOpen size={11} strokeWidth={1.5} className="flex-shrink-0 text-text-dim" />
            <span className="truncate">{r.title}</span>
          </button>
        ))}

        {locked.length > 0 && (
          <div className="mt-1 border-t border-border pt-1">
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
                  className="flex items-center gap-2 px-3 py-1 text-[12px] text-text-dim/60"
                  title={hint}
                >
                  <BookOpen size={11} strokeWidth={1.5} className="flex-shrink-0" />
                  <span className="truncate">{r.title}</span>
                  <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.08em] flex-shrink-0 opacity-50">
                    locked
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
