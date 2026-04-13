"use client";

import { useState } from "react";
import { CheckCircle2, Circle, CircleDot, ChevronRight } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import type { Module } from "@/lib/types";

export function ModuleList() {
  const { course, activeModule, activeSubmodule, passedSubmodules, setActiveSubmodule } =
    useWorkspace();

  // Track which modules are expanded — active module is expanded by default
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!course) return null;

  const totalSubmodules = course.modules.reduce(
    (acc, m) => acc + m.submodules.length,
    0
  );
  const completedCount = passedSubmodules.size;
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
    <div className="p-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary">
        {course.meta.title}
      </h4>
      <p className="text-[10px] text-text-dim capitalize">{course.meta.language}</p>

      {/* Overall progress */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>Progreso</span>
          <span>
            {completedCount}/{totalSubmodules}
          </span>
        </div>
        <div className="mt-1 h-1 rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${totalSubmodules > 0 ? (completedCount / totalSubmodules) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Modules */}
      <div className="mt-4 flex flex-col gap-1">
        {course.modules.map((mod) => {
          const open = isModuleExpanded(mod);
          const { done, total } = moduleProgress(mod);
          const allDone = done === total;

          return (
            <div key={mod.id}>
              {/* Module header — clickable to expand/collapse */}
              <button
                onClick={() => toggleModule(mod)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-surface-hover transition-colors"
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
                      className={`text-[11px] font-semibold truncate ${
                        allDone ? "text-success" : "text-text-muted"
                      }`}
                    >
                      {mod.title}
                    </span>
                    <span className="text-[9px] text-text-dim flex-shrink-0">
                      {done}/{total}
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {open && (
                <div className="ml-2 border-l border-border pl-2">
                  {/* Module description */}
                  <p className="px-2 py-1 text-[10px] leading-relaxed text-text-dim">
                    {mod.description}
                  </p>

                  {/* Submodules */}
                  <div className="mt-1 flex flex-col gap-0.5">
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
                        <div key={sub.full_id}>
                          <button
                            onClick={() => {
                              if (!locked) setActiveSubmodule(mod, sub);
                            }}
                            disabled={locked}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
                              isActive
                                ? "bg-primary-subtle border-l-2 border-primary"
                                : locked
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-surface-hover"
                            }`}
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
                            ) : (
                              <Circle
                                size={14}
                                className="flex-shrink-0 text-text-dim"
                              />
                            )}
                            <span
                              className={`text-xs ${
                                isActive
                                  ? "font-medium text-text"
                                  : passed
                                    ? "text-text-muted"
                                    : "text-text-dim"
                              }`}
                            >
                              {sub.title}
                            </span>
                          </button>

                          {/* Active submodule spec */}
                          {isActive && sub.spec && (
                            <div className="mx-2 mt-1 mb-2 rounded-md bg-bg p-2">
                              <p className="text-[10px] leading-relaxed text-text-muted">
                                {sub.spec}
                              </p>
                            </div>
                          )}
                        </div>
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
