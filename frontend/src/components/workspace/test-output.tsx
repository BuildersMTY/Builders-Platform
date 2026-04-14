"use client";

import { useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { X, CheckCircle2, XCircle, Circle, Loader2, Play } from "lucide-react";
import { useWorkspace, getResourceStage, isResourceVisible } from "./workspace-provider";
import { useTestRunner } from "@/hooks/use-test-runner";
import { ResizeHandle } from "./resize-handle";
import { toast } from "sonner";

export function TestOutput() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    activeSubmodule,
    setTestOutputOpen,
    markSubmodulePassed,
    testPanelHeight,
    setTestPanelHeight,
    cacheTestResults,
    getCachedTestResults,
    showSuccess,
    recordRun,
    getRunHistory,
  } = useWorkspace();

  const subId = activeSubmodule?.full_id ?? null;

  const { status, lines, allPassed, run } = useTestRunner(
    params.courseId,
    params.lang,
    subId
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore cached results when switching submodules
  const cached = subId ? getCachedTestResults(subId) : undefined;
  const displayLines = status === "idle" && cached ? cached.lines : lines;
  const displayAllPassed =
    status === "idle" && cached ? cached.allPassed : allPassed;
  const displayStatus =
    status === "idle" && cached ? "done" : status;

  // Auto-run on first mount if no cache
  const hasRunOnMount = useRef(false);
  useEffect(() => {
    if (!hasRunOnMount.current && status === "idle" && !cached) {
      hasRunOnMount.current = true;
      run();
    }
  }, [run, status, cached]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length]);

  // Listen for run requests
  useEffect(() => {
    function handleRun() {
      run();
    }
    window.addEventListener("buildmancer:run-tests", handleRun);
    return () => {
      window.removeEventListener("buildmancer:run-tests", handleRun);
    };
  }, [run]);

  // Cache results, record run, trigger success, notify new resources
  useEffect(() => {
    if (status === "done" && subId) {
      const passed = allPassed ?? false;

      // Record run history (for staged resources)
      const prevHistory = getRunHistory(subId);
      recordRun(subId, passed);

      // Check if new resources become visible after this run
      if (activeSubmodule) {
        const newHistory = {
          totalRuns: (prevHistory?.totalRuns ?? 0) + 1,
          failedRuns: (prevHistory?.failedRuns ?? 0) + (passed ? 0 : 1),
        };
        for (const res of activeSubmodule.resources) {
          const stage = getResourceStage(res.type);
          const wasBefore = isResourceVisible(stage, prevHistory);
          const isNow = isResourceVisible(stage, newHistory);
          if (!wasBefore && isNow) {
            toast.info(`Nuevo recurso: ${res.title}`, {
              duration: 4000,
            });
          }
        }
      }

      // Cache test results
      cacheTestResults(subId, {
        lines,
        allPassed,
        timestamp: Date.now(),
      });

      if (allPassed) {
        markSubmodulePassed(subId);
        showSuccess(subId);
      }
    }
  }, [status, subId, lines, allPassed, cacheTestResults, markSubmodulePassed, showSuccess, recordRun, getRunHistory, activeSubmodule]);

  // Resize handler
  const handleResize = useCallback(
    (delta: number) => {
      // Negative delta = dragging up = increasing height
      setTestPanelHeight(testPanelHeight - delta);
    },
    [testPanelHeight, setTestPanelHeight]
  );

  const passedCount = displayLines.filter((l) => l.passed === true).length;
  const failedCount = displayLines.filter((l) => l.passed === false).length;
  const totalCount = passedCount + failedCount;

  return (
    <div className="flex flex-col flex-shrink-0">
      <ResizeHandle direction="vertical" onResize={handleResize} />
      <div
        className={`border-t border-border flex flex-col animate-slideUp shadow-[0_-4px_16px_rgba(0,0,0,0.2)] ${
          displayAllPassed === true
            ? "bg-success/[0.06]"
            : "bg-surface"
        }`}
        style={{ height: `${testPanelHeight}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base tracking-tight">
              <span className="font-serif italic text-primary">Resultados</span>
            </span>
            {status === "running" && (
              <Loader2 size={12} className="animate-spin text-text-muted" />
            )}
            {displayStatus === "done" && totalCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  displayAllPassed
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                }`}
              >
                {passedCount}/{totalCount} pasaron
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {status !== "running" && (
              <button
                onClick={() => run()}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
                aria-label="Re-run tests"
              >
                <Play size={10} />
                <span>Ejecutar</span>
              </button>
            )}
            <button
              onClick={() => setTestOutputOpen(false)}
              className="rounded p-1 text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
              aria-label="Close test output"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div ref={scrollRef} className="overflow-y-auto p-4 flex-1">
          {displayLines.length === 0 && status === "idle" && (
            <p className="text-xs text-text-dim">
              Ejecuta las pruebas para verificar tu implementación.
            </p>
          )}
          {displayLines.length === 0 && status === "running" && (
            <p className="text-xs text-text-dim">Ejecutando pruebas...</p>
          )}

          <div className="flex flex-col gap-2" role="list" aria-label="Test results">
            {displayLines.map((line, i) => (
              <div
                key={i}
                className="animate-fadeIn"
                style={{ animationDelay: `${i * 60}ms` }}
                role="listitem"
                aria-label={`${line.passed === true ? "Passed" : line.passed === false ? "Failed" : "Info"}: ${line.message}`}
              >
                <div className="flex items-start gap-2">
                  {line.passed === true ? (
                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-success" />
                  ) : line.passed === false ? (
                    <XCircle size={14} className="mt-0.5 flex-shrink-0 text-error" />
                  ) : (
                    <Circle size={14} className="mt-0.5 flex-shrink-0 text-text-dim" />
                  )}
                  <span
                    className={`text-xs ${
                      line.passed === false
                        ? "text-error"
                        : line.passed === null
                          ? "text-text-dim"
                          : "text-text-muted"
                    }`}
                  >
                    {line.message}
                  </span>
                </div>

                {line.passed === false && line.expected != null && line.actual != null && (
                  <div className="ml-6 mt-1.5 rounded bg-error/[0.06] px-3 py-2 text-[11px] font-mono">
                    <div className="flex items-start gap-1">
                      <span className="text-text-dim flex-shrink-0">expected:</span>
                      <span className="text-success break-all">{line.expected}</span>
                    </div>
                    <div className="flex items-start gap-1 mt-0.5">
                      <span className="text-text-dim flex-shrink-0">{"     got:"}</span>
                      <span className="text-error break-all">{line.actual}</span>
                    </div>
                  </div>
                )}

                {line.passed === false && line.hint && (
                  <div className="ml-6 mt-1.5 rounded bg-warning/[0.06] px-3 py-2 text-[11px] text-warning/80">
                    {line.hint}
                  </div>
                )}
              </div>
            ))}
          </div>

          {displayStatus === "done" && displayAllPassed && (
            <SuccessCTA />
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessCTA() {
  const { course, activeSubmodule, setActiveSubmodule, dismissSuccess } =
    useWorkspace();

  if (!course || !activeSubmodule) return null;

  const allSubs = course.modules.flatMap((m) =>
    m.submodules.map((s) => ({ module: m, sub: s }))
  );
  const currentIdx = allSubs.findIndex(
    (s) => s.sub.full_id === activeSubmodule.full_id
  );
  const next = currentIdx >= 0 ? allSubs[currentIdx + 1] : undefined;

  if (!next) {
    return (
      <div className="mt-3 rounded-full bg-success/5 px-4 py-2 border border-success/10 inline-flex">
        <p className="text-xs font-medium text-success">Proyecto completado</p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={() => {
          dismissSuccess();
          setActiveSubmodule(next.module, next.sub);
        }}
        className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors"
      >
        Siguiente tarea →
      </button>
    </div>
  );
}
