"use client";

import { X } from "lucide-react";
import { useWorkspace } from "./workspace-provider";

interface TabBarProps {
  saving?: boolean;
  saved?: boolean;
}

export function TabBar({ saving, saved }: TabBarProps) {
  const { openFiles, activeFile, setActiveFile, closeFile } = useWorkspace();

  if (openFiles.length === 0) return null;

  return (
    <div className="flex h-9 items-center gap-px overflow-x-auto bg-surface border-b border-border px-2">
      {openFiles.map((filepath) => {
        const filename = filepath.split("/").pop() ?? filepath;
        const isActive = filepath === activeFile;

        return (
          <div
            key={filepath}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer transition-colors ${
              isActive
                ? "bg-bg text-text"
                : "text-text-muted hover:text-text"
            }`}
            onClick={() => setActiveFile(filepath)}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
            )}
            <span>{filename}</span>
            {isActive && (saving || saved) && (
              <span className="text-[10px] text-text-dim">{saving ? "..." : "✓"}</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); closeFile(filepath); }}
              className="ml-1 hidden rounded p-0.5 text-text-dim hover:text-text hover:bg-surface-hover group-hover:block"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
