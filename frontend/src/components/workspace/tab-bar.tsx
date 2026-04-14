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
      className="flex h-10 items-center gap-px overflow-x-auto bg-surface border-b border-border"
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
            className={`group relative flex items-center gap-2 px-3.5 py-2 text-xs cursor-pointer transition-colors select-none ${
              isActive
                ? "bg-bg text-text font-medium"
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
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm" />
            )}
            {isResource ? (
              <BookOpen size={12} className="flex-shrink-0 text-warning/70" />
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getExtColor(label)}`} />
            )}
            <span className="truncate max-w-[140px]">{label}</span>
            {/* Save status (code tabs only) */}
            {isActive && !isResource && saving && (
              <span className="text-[10px] text-text-dim">...</span>
            )}
            {isActive && !isResource && saved && !saving && (
              <span className="text-[10px] text-success">✓</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); closeFile(tabId); }}
              className={`ml-1 rounded p-0.5 text-text-dim hover:text-text hover:bg-surface-hover transition-colors ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              aria-label={`Close ${label}`}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
