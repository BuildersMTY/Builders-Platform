"use client";

import { File } from "lucide-react";
import { useWorkspace } from "./workspace-provider";

export function FileTree() {
  const { files, activeFile, openFile } = useWorkspace();

  if (files.length === 0) {
    return (
      <div className="p-3">
        <p className="text-xs text-text-dim">No hay archivos todavía.</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary">Archivos</h4>
      <div className="mt-3 flex flex-col gap-0.5">
        {files.map((f) => (
          <button
            key={f.filepath}
            onClick={() => openFile(f.filepath)}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
              activeFile === f.filepath
                ? "bg-surface-hover text-text"
                : "text-text-muted hover:bg-surface-hover hover:text-text"
            }`}
          >
            <File size={14} className="flex-shrink-0" />
            {f.filepath.split("/").pop()}
          </button>
        ))}
      </div>
    </div>
  );
}
