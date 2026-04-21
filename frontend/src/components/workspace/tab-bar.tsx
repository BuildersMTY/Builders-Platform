"use client";

import { X, BookOpen } from "lucide-react";
import { useWorkspace, isResourceTab, parseResourceTab } from "./workspace-provider";

interface TabBarProps {
  saving?: boolean;
  saved?: boolean;
}

const extColors: Record<string, string> = {
  go: "bg-teal-400",
  py: "bg-blue-400",
  js: "bg-yellow-400",
  ts: "bg-blue-500",
  sh: "bg-green-500",
  mod: "bg-teal-400",
  sum: "bg-teal-400",
};

function getExtColor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return extColors[ext] ?? "bg-text-dim";
}

export function TabBar({ saving, saved }: TabBarProps) {
  const { openFiles, activeFile, setActiveFile, closeFile } = useWorkspace();

  if (openFiles.length === 0) return null;

  return (
    <div
      className="flex h-8 items-center overflow-x-auto bg-surface border-b border-border"
      role="tablist"
      aria-label="Open files"
    >
      {openFiles.map((tabId) => {
        const isResource = isResourceTab(tabId);
        const isActive = tabId === activeFile;

        let label: string;
        if (isResource) {
          label = parseResourceTab(tabId).title;
        } else {
          label = tabId.split("/").pop() ?? tabId;
        }

        return (
          <div
            key={tabId}
            className={`group relative flex h-8 items-center gap-2 border-r border-border px-3 font-mono text-[11px] cursor-pointer select-none transition-colors ${
              isActive
                ? "bg-bg text-text"
                : "text-text-dim hover:text-text-muted hover:bg-surface-hover"
            }`}
            onClick={() => setActiveFile(tabId)}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                closeFile(tabId);
              }
            }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
          >
            {isActive && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-primary" />
            )}
            {isResource ? (
              <BookOpen size={11} className="flex-shrink-0 text-text-dim" strokeWidth={1.5} />
            ) : (
              <span className={`h-1 w-1 flex-shrink-0 rounded-full ${getExtColor(label)}`} />
            )}
            <span className="truncate max-w-[140px]">{label}</span>
            {/* Save status (code tabs only) */}
            {isActive && !isResource && saving && (
              <span className="text-[10px] text-text-dim tabular-nums">saving</span>
            )}
            {isActive && !isResource && saved && !saving && (
              <span className="h-1 w-1 flex-shrink-0 rounded-full bg-success" aria-label="Saved" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); closeFile(tabId); }}
              className={`ml-0.5 p-0.5 text-text-dim hover:text-text transition-colors ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              aria-label={`Close ${label}`}
            >
              <X size={11} strokeWidth={1.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
