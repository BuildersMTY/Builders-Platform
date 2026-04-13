"use client";

import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { useWorkspace } from "./workspace-provider";

export function ModuleList() {
  const { course, activeSubmodule, passedSubmodules, setActiveSubmodule } = useWorkspace();

  if (!course) return null;

  const totalSubmodules = course.modules.reduce((acc, m) => acc + m.submodules.length, 0);
  const completedCount = passedSubmodules.size;

  return (
    <div className="p-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary">{course.meta.title}</h4>
      <p className="text-[10px] text-text-dim capitalize">{course.meta.language}</p>

      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>Progreso</span>
          <span>{completedCount}/{totalSubmodules}</span>
        </div>
        <div className="mt-1 h-1 rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${totalSubmodules > 0 ? (completedCount / totalSubmodules) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {course.modules.map((mod) => {
          const allSubs = course.modules.flatMap((m) => m.submodules);

          return (
            <div key={mod.id}>
              {/* Module group header */}
              <div className="mt-3 first:mt-0 mb-1 px-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                  {mod.title}
                </span>
              </div>

              {/* Submodules */}
              <div className="flex flex-col gap-0.5">
                {mod.submodules.map((sub) => {
                  const passed = passedSubmodules.has(sub.full_id);
                  const isActive = activeSubmodule?.full_id === sub.full_id;
                  const idx = allSubs.findIndex((s) => s.full_id === sub.full_id);
                  const locked = !passed && !isActive && idx > 0 && !passedSubmodules.has(allSubs[idx - 1].full_id);

                  return (
                    <button
                      key={sub.full_id}
                      onClick={() => { if (!locked) setActiveSubmodule(mod, sub); }}
                      disabled={locked}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
                        isActive
                          ? "bg-primary-subtle border-l-2 border-primary"
                          : locked
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-surface-hover"
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 size={16} className="flex-shrink-0 text-success" />
                      ) : isActive ? (
                        <CircleDot size={16} className="flex-shrink-0 text-warning" />
                      ) : (
                        <Circle size={16} className="flex-shrink-0 text-text-dim" />
                      )}
                      <span className={`text-xs ${isActive ? "font-medium text-text" : passed ? "text-text-muted" : "text-text-dim"}`}>
                        {sub.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
