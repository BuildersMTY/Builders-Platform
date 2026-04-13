"use client";

import { useWorkspace } from "./workspace-provider";

export function Panel() {
  const { panelView, panelOpen, activeSubmodule, openResourceReader } = useWorkspace();

  if (!panelOpen || !panelView) return null;

  return (
    <div className="h-full w-[220px] flex-shrink-0 overflow-y-auto border-r border-border bg-surface">
      {panelView === "modules" && <ModulesPlaceholder />}
      {panelView === "files" && <FilesPlaceholder />}
      {panelView === "resources" && <ResourceList />}
    </div>
  );
}

function ModulesPlaceholder() {
  return (
    <div className="p-3">
      <p className="text-xs text-text-dim">Módulos (loading in Task 10)</p>
    </div>
  );
}

function FilesPlaceholder() {
  return (
    <div className="p-3">
      <p className="text-xs text-text-dim">Archivos (loading in Task 10)</p>
    </div>
  );
}

function ResourceList() {
  const { activeSubmodule, openResourceReader } = useWorkspace();

  if (!activeSubmodule) {
    return (
      <div className="p-3">
        <p className="text-xs text-text-dim">Selecciona un submódulo primero.</p>
      </div>
    );
  }

  const resources = activeSubmodule.resources;

  return (
    <div className="p-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary">Recursos</h4>
      <div className="mt-3 flex flex-col gap-1">
        {resources.length === 0 ? (
          <p className="text-xs text-text-dim">Sin recursos para este submódulo.</p>
        ) : (
          resources.map((r) => (
            <button
              key={r.file}
              onClick={() => openResourceReader(r.file)}
              className="rounded-md px-2 py-1.5 text-left text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
            >
              {r.title}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
