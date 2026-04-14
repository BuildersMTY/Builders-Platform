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

  // Derive headline: first sentence of spec (up to first period + space, or 120 chars)
  const dotIdx = spec.indexOf(". ");
  const colonIdx = spec.indexOf(": ");
  const cutPoint = dotIdx > 0 && dotIdx < 120 ? dotIdx + 1 : colonIdx > 0 && colonIdx < 80 ? colonIdx + 1 : Math.min(spec.length, 100);
  const headline = spec.slice(0, cutPoint).trim();
  const detail = spec.slice(cutPoint).trim();

  return (
    <div className="relative border-b border-border bg-surface-alt overflow-hidden" role="region" aria-label="Current task">
      {/* Ambient glow — matches landing page pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 80% at 0% 50%, rgba(255, 0, 0, 0.03) 0%, transparent 70%)",
        }}
      />

      {/* Header — always visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="relative flex w-full items-center gap-2.5 px-5 py-2.5 text-left group"
        aria-expanded={!collapsed}
        aria-label="Current task"
      >
        <ChevronDown
          size={12}
          className={`flex-shrink-0 text-text-dim transition-transform duration-150 ${
            collapsed ? "-rotate-90" : ""
          }`}
        />
        <span className="text-base tracking-tight flex-shrink-0">
          <span className="font-serif italic text-primary">Task</span>
        </span>
        {collapsed && (
          <span className="text-xs text-text-muted truncate">{headline}</span>
        )}
      </button>

      {/* Expandable content */}
      {!collapsed && (
        <div className="relative px-5 pb-4">
          <p className="text-sm leading-relaxed text-text-muted">{spec}</p>

          {/* Stub file chips */}
          {stubs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {stubs.map((stub) => {
                const filename = stub.path.split("/").pop() ?? stub.path;
                return (
                  <button
                    key={stub.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      openFile(stub.path);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-mono text-text-muted hover:text-text hover:bg-white/[0.08] transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
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
