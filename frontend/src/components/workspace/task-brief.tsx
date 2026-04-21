"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useWorkspace } from "./workspace-provider";

export function TaskBrief() {
  const { activeSubmodule, openFile } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);

  // Expand whenever the active submodule changes
  useEffect(() => {
    setCollapsed(false);
  }, [activeSubmodule?.full_id]);

  if (!activeSubmodule) return null;

  const spec = activeSubmodule.spec;
  const stubs = activeSubmodule.stubs;
  const title = activeSubmodule.title;

  // Derive headline: first sentence of spec (for collapsed state)
  const dotIdx = spec.indexOf(". ");
  const colonIdx = spec.indexOf(": ");
  const cutPoint = dotIdx > 0 && dotIdx < 120 ? dotIdx + 1 : colonIdx > 0 && colonIdx < 80 ? colonIdx + 1 : Math.min(spec.length, 100);
  const headline = spec.slice(0, cutPoint).trim();

  return (
    <div className="border-b border-border bg-surface-alt" role="region" aria-label="Current task">
      {/* Header — always visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2.5 px-4 py-2 text-left"
        aria-expanded={!collapsed}
        aria-label="Current task"
      >
        <ChevronDown
          size={11}
          strokeWidth={1.75}
          className={`flex-shrink-0 text-text-dim transition-transform duration-150 ${
            collapsed ? "-rotate-90" : ""
          }`}
        />
        <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
          task
        </span>
        <span className="h-3 w-px bg-border flex-shrink-0" />
        <span className="truncate text-xs font-medium text-text">{title}</span>
        {collapsed && (
          <span className="truncate text-xs text-text-muted">— {headline}</span>
        )}
      </button>

      {/* Expandable content */}
      {!collapsed && (
        <div className="px-4 pb-3 pl-[40px]">
          <p className="text-[13px] leading-[1.55] text-text-muted">{spec}</p>

          {/* Stub file chips */}
          {stubs.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {stubs.map((stub) => {
                const filename = stub.path.split("/").pop() ?? stub.path;
                return (
                  <button
                    key={stub.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      openFile(stub.path);
                    }}
                    className="group inline-flex items-center gap-1.5 border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-text-muted hover:border-text-dim hover:text-text transition-colors"
                  >
                    <span className="h-1 w-1 flex-shrink-0 bg-text-dim group-hover:bg-text" />
                    {filename}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
