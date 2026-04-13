"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { X, CheckCircle2, XCircle, Circle, Loader2 } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { useTestRunner } from "@/hooks/use-test-runner";

export function TestOutput() {
  const params = useParams<{ courseId: string; lang: string }>();
  const { activeSubmodule, setTestOutputOpen, markSubmodulePassed } = useWorkspace();

  const { status, lines, allPassed, run } = useTestRunner(
    params.courseId,
    params.lang,
    activeSubmodule?.full_id ?? null
  );

  // Auto-run on first mount (panel was opened by the run button)
  const hasRunOnMount = useRef(false);
  useEffect(() => {
    if (!hasRunOnMount.current && status === "idle") {
      hasRunOnMount.current = true;
      run();
    }
  }, [run, status]);

  // Listen for subsequent run requests and escape
  useEffect(() => {
    function handleRun() {
      run();
    }
    function handleEscape() {
      setTestOutputOpen(false);
    }
    window.addEventListener("buildmancer:run-tests", handleRun);
    window.addEventListener("buildmancer:escape", handleEscape);
    return () => {
      window.removeEventListener("buildmancer:run-tests", handleRun);
      window.removeEventListener("buildmancer:escape", handleEscape);
    };
  }, [run, setTestOutputOpen]);

  useEffect(() => {
    if (allPassed && activeSubmodule) {
      markSubmodulePassed(activeSubmodule.full_id);
    }
  }, [allPassed, activeSubmodule, markSubmodulePassed]);

  const passedCount = lines.filter((l) => l.passed === true).length;
  const totalCount = lines.filter((l) => l.passed !== null).length;

  return (
    <div className="border-t border-border bg-surface animate-slideUp" style={{ height: "180px" }}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Test Output</span>
          {status === "running" && <Loader2 size={12} className="animate-spin text-text-muted" />}
          {status === "done" && totalCount > 0 && (
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${allPassed ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
              {passedCount}/{totalCount} passed
            </span>
          )}
        </div>
        <button onClick={() => setTestOutputOpen(false)} className="text-text-dim hover:text-text transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="overflow-y-auto p-3" style={{ height: "calc(180px - 37px)" }}>
        {lines.length === 0 && status === "running" && (
          <p className="text-xs text-text-dim">Ejecutando pruebas...</p>
        )}
        <div className="flex flex-col gap-1">
          {lines.map((line, i) => (
            <div key={i} className="flex items-start gap-2 animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
              {line.passed === true ? (
                <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-success" />
              ) : line.passed === false ? (
                <XCircle size={14} className="mt-0.5 flex-shrink-0 text-error" />
              ) : (
                <Circle size={14} className="mt-0.5 flex-shrink-0 text-text-dim" />
              )}
              <span className={`text-xs ${line.passed === false ? "text-error" : line.passed === null ? "text-text-dim" : "text-text-muted"}`}>
                {line.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
