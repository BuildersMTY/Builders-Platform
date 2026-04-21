"use client";

import { useState } from "react";
import { CheckCircle2, Circle, CircleDot, ChevronRight, Lock } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import type { Module } from "@/lib/types";

export function ModuleList() {
  const { course, activeModule, activeSubmodule, passedSubmodules, setActiveSubmodule } =
    useWorkspace();

  // Track which modules are expanded — active module is expanded by default
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!course) return null;

  const allSubs = course.modules.flatMap((m) => m.submodules);

  function isModuleExpanded(mod: Module) {
    return expanded.has(mod.id) || activeModule?.id === mod.id;
  }

  function toggleModule(mod: Module) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(mod.id)) {
        next.delete(mod.id);
      } else {
        next.add(mod.id);
      }
      return next;
    });
  }

  function moduleProgress(mod: Module) {
    const total = mod.submodules.length;
    const done = mod.submodules.filter((s) => passedSubmodules.has(s.full_id)).length;
    return { done, total };
  }

  return (
    <div className="flex flex-col">
      {/* Header rail */}
      <div className="flex h-7 items-center justify-between border-b border-border px-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
          modules
        </span>
        <span className="font-mono text-[10px] tabular-nums text-text-dim/70">
          {course.meta.language}
        </span>
      </div>

      {/* Course title block */}
      <div className="border-b border-border px-3 py-2">
        <p className="truncate text-[12px] font-medium leading-tight text-text">
          {course.meta.title}
        </p>
      </div>

      {/* Modules */}
      <div className="flex flex-col gap-px py-1">
        {course.modules.map((mod) => {
          const open = isModuleExpanded(mod);
          const { done, total } = moduleProgress(mod);
          const allDone = done === total;

          return (
            <div key={mod.id}>
              {/* Module header */}
              <button
                onClick={() => toggleModule(mod)}
                className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left hover:bg-surface-hover transition-colors"
                aria-expanded={open}
              >
                <ChevronRight
                  size={11}
                  strokeWidth={1.75}
                  className={`flex-shrink-0 text-text-dim transition-transform duration-150 ${
                    open ? "rotate-90" : ""
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-[12px] font-medium ${
                        allDone ? "text-success" : "text-text-muted"
                      }`}
                    >
                      {mod.title}
                    </span>
                    <span className="flex-shrink-0 font-mono text-[10px] tabular-nums text-text-dim/70">
                      {done}/{total}
                    </span>
                  </div>
                  {/* Segmented progress meter — flat, no rounding */}
                  <div className="mt-1 flex gap-px">
                    {mod.submodules.map((sub) => (
                      <div
                        key={sub.full_id}
                        className={`h-[2px] flex-1 transition-colors duration-300 ${
                          passedSubmodules.has(sub.full_id)
                            ? "bg-success"
                            : activeSubmodule?.full_id === sub.full_id
                              ? "bg-primary"
                              : "bg-surface-hover"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {open && (
                <div className="flex flex-col">
                  {mod.submodules.map((sub) => {
                    const passed = passedSubmodules.has(sub.full_id);
                    const isActive = activeSubmodule?.full_id === sub.full_id;
                    const idx = allSubs.findIndex(
                      (s) => s.full_id === sub.full_id
                    );
                    const locked =
                      !passed &&
                      !isActive &&
                      idx > 0 &&
                      !passedSubmodules.has(allSubs[idx - 1].full_id);

                    return (
                      <button
                        key={sub.full_id}
                        onClick={() => {
                          if (!locked) setActiveSubmodule(mod, sub);
                        }}
                        disabled={locked}
                        title={locked && idx > 0 ? `Completa "${allSubs[idx - 1].title}" primero` : undefined}
                        className={`flex w-full items-center gap-2 py-1 pl-8 pr-3 text-left transition-colors duration-150 ${
                          isActive
                            ? "bg-bg"
                            : locked
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:bg-surface-hover"
                        }`}
                        aria-selected={isActive}
                        role="treeitem"
                      >
                        {passed ? (
                          <CheckCircle2
                            size={12}
                            strokeWidth={1.75}
                            className="flex-shrink-0 text-success"
                          />
                        ) : isActive ? (
                          <CircleDot
                            size={12}
                            strokeWidth={1.75}
                            className="flex-shrink-0 text-primary"
                          />
                        ) : locked ? (
                          <Lock
                            size={11}
                            strokeWidth={1.75}
                            className="flex-shrink-0 text-text-dim"
                          />
                        ) : (
                          <Circle
                            size={12}
                            strokeWidth={1.5}
                            className="flex-shrink-0 text-text-dim"
                          />
                        )}
                        <span
                          className={`truncate text-[12px] ${
                            isActive
                              ? "font-medium text-text"
                              : passed
                                ? "text-text-muted"
                                : "text-text-dim"
                          }`}
                        >
                          {sub.title}
                        </span>
                        {isActive && sub.stubs.length > 0 && (
                          <span className="ml-auto font-mono text-[10px] tabular-nums text-text-dim/70 flex-shrink-0">
                            {sub.stubs.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
