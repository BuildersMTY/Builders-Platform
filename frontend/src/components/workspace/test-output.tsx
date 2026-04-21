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
        className="border-t border-border bg-surface flex flex-col animate-slideUp"
        style={{ height: `${testPanelHeight}px` }}
      >
        {/* Header — single-row context strip */}
        <div className="flex h-7 items-center justify-between border-b border-border px-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
              tests
            </span>
            {status === "running" && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
                <Loader2 size={10} strokeWidth={1.75} className="animate-spin" />
                running
              </span>
            )}
            {displayStatus === "done" && totalCount > 0 && (
              <span
                className={`font-mono text-[10px] tabular-nums ${
                  displayAllPassed ? "text-success" : "text-error"
                }`}
              >
                {passedCount}/{totalCount} passed
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {status !== "running" && (
              <button
                onClick={() => run()}
                className="flex items-center gap-1 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
                aria-label="Re-run tests"
              >
                <Play size={9} strokeWidth={1.75} />
                <span>run</span>
              </button>
            )}
            <button
              onClick={() => setTestOutputOpen(false)}
              className="p-1 text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
              aria-label="Close test output"
            >
              <X size={12} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Results — terminal-grade, monospace */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono">
          {displayLines.length === 0 && status === "idle" && (
            <p className="text-[11px] text-text-dim">
              $ run tests to verify your implementation
            </p>
          )}
          {displayLines.length === 0 && status === "running" && (
            <p className="text-[11px] text-text-dim">$ running tests...</p>
          )}

          <div className="flex flex-col" role="list" aria-label="Test results">
            {displayLines.map((line, i) => (
              <div
                key={i}
                className="animate-fadeIn py-0.5"
                style={{ animationDelay: `${i * 40}ms` }}
                role="listitem"
                aria-label={`${line.passed === true ? "Passed" : line.passed === false ? "Failed" : "Info"}: ${line.message}`}
              >
                <div className="flex items-start gap-2">
                  {line.passed === true ? (
                    <CheckCircle2 size={12} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-success" />
                  ) : line.passed === false ? (
                    <XCircle size={12} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-error" />
                  ) : (
                    <Circle size={12} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-text-dim" />
                  )}
                  <span
                    className={`text-[11px] leading-relaxed ${
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
                  <div className="ml-[22px] mt-1 border-l border-error/30 bg-error/[0.04] px-3 py-1.5 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-text-dim">expected</span>
                      <span className="break-all text-success">{line.expected}</span>
                    </div>
                    <div className="mt-0.5 flex items-start gap-2">
                      <span className="flex-shrink-0 text-text-dim">{"  actual"}</span>
                      <span className="break-all text-error">{line.actual}</span>
                    </div>
                  </div>
                )}

                {line.passed === false && line.hint && (
                  <div className="ml-[22px] mt-1 border-l border-warning/30 bg-warning/[0.04] px-3 py-1.5 text-[11px] text-warning/80">
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
      <div className="mt-3 inline-flex border border-success/30 bg-success/5 px-3 py-1.5">
        <p className="font-mono text-[11px] text-success">project complete</p>
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
        className="bg-primary px-3.5 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors"
      >
        Siguiente tarea →
      </button>
    </div>
  );
}
