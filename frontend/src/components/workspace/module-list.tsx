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
    <div className="p-4">
      <h4 className="text-base tracking-tight">
        <span className="font-serif italic text-primary">{course.meta.title}</span>
      </h4>
      <p className="text-[10px] text-text-dim capitalize font-mono mt-0.5">{course.meta.language}</p>

      {/* Modules */}
      <div className="mt-5 flex flex-col gap-1.5">
        {course.modules.map((mod) => {
          const open = isModuleExpanded(mod);
          const { done, total } = moduleProgress(mod);
          const allDone = done === total;

          return (
            <div key={mod.id}>
              {/* Module header */}
              <button
                onClick={() => toggleModule(mod)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-surface-hover transition-colors"
                aria-expanded={open}
              >
                <ChevronRight
                  size={12}
                  className={`flex-shrink-0 text-text-dim transition-transform duration-150 ${
                    open ? "rotate-90" : ""
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-semibold truncate ${
                        allDone ? "text-success" : "text-text-muted"
                      }`}
                    >
                      {mod.title}
                    </span>
                  </div>
                  {/* Segmented progress bar */}
                  <div className="flex gap-0.5 mt-1.5">
                    {mod.submodules.map((sub) => (
                      <div
                        key={sub.full_id}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          passedSubmodules.has(sub.full_id)
                            ? "bg-success"
                            : activeSubmodule?.full_id === sub.full_id
                              ? "bg-warning"
                              : "bg-surface-hover"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {open && (
                <div className="ml-2 border-l border-border pl-2">
                  {/* Submodules */}
                  <div className="mt-1.5 flex flex-col gap-1">
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
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
                            isActive
                              ? "bg-primary-subtle"
                              : locked
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-surface-hover"
                          }`}
                          aria-selected={isActive}
                          role="treeitem"
                        >
                          {passed ? (
                            <CheckCircle2
                              size={14}
                              className="flex-shrink-0 text-success"
                            />
                          ) : isActive ? (
                            <CircleDot
                              size={14}
                              className="flex-shrink-0 text-warning"
                            />
                          ) : locked ? (
                            <Lock
                              size={13}
                              className="flex-shrink-0 text-text-dim"
                            />
                          ) : (
                            <Circle
                              size={14}
                              className="flex-shrink-0 text-text-dim"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-xs truncate block ${
                                isActive
                                  ? "font-medium text-text"
                                  : passed
                                    ? "text-text-muted"
                                    : "text-text-dim"
                              }`}
                            >
                              {sub.title}
                            </span>
                            {/* Stub count badge */}
                            {isActive && sub.stubs.length > 0 && (
                              <span className="text-[10px] text-text-dim">
                                {sub.stubs.length} archivo{sub.stubs.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
