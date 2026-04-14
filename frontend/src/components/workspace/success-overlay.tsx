"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWorkspace } from "./workspace-provider";

export function SuccessOverlay() {
  const {
    showSuccessOverlay,
    completedSubmoduleId,
    course,
    activeSubmodule,
    dismissSuccess,
    setActiveSubmodule,
  } = useWorkspace();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!showSuccessOverlay) return;
    timerRef.current = setTimeout(() => {
      dismissSuccess();
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showSuccessOverlay, dismissSuccess]);

  const handleContinue = useCallback(() => {
    if (!course || !activeSubmodule) {
      dismissSuccess();
      return;
    }

    // Find next submodule
    const allSubs = course.modules.flatMap((m) =>
      m.submodules.map((s) => ({ module: m, sub: s }))
    );
    const currentIdx = allSubs.findIndex(
      (s) => s.sub.full_id === activeSubmodule.full_id
    );
    const next = currentIdx >= 0 ? allSubs[currentIdx + 1] : undefined;

    dismissSuccess();
    if (next) {
      setActiveSubmodule(next.module, next.sub);
    }
  }, [course, activeSubmodule, dismissSuccess, setActiveSubmodule]);

  const handleSkip = useCallback(() => {
    const count = parseInt(
      localStorage.getItem("buildmancer:skip-celebration") ?? "0",
      10
    );
    localStorage.setItem("buildmancer:skip-celebration", String(count + 1));
    dismissSuccess();
  }, [dismissSuccess]);

  // Auto-skip if user has dismissed 3+ times (moved to effect to avoid render-time state update)
  useEffect(() => {
    if (!showSuccessOverlay) return;
    const skipCount = parseInt(
      localStorage.getItem("buildmancer:skip-celebration") ?? "0",
      10
    );
    if (skipCount >= 3) {
      dismissSuccess();
    }
  }, [showSuccessOverlay, dismissSuccess]);

  if (!showSuccessOverlay || !course) return null;

  // Determine completion type
  const allSubs = course.modules.flatMap((m) =>
    m.submodules.map((s) => ({ module: m, sub: s }))
  );
  const currentIdx = allSubs.findIndex(
    (s) => s.sub.full_id === completedSubmoduleId
  );
  const isLastInCourse = currentIdx === allSubs.length - 1;

  const currentModule = allSubs[currentIdx]?.module;
  const isLastInModule =
    currentModule &&
    currentIdx >= 0 &&
    allSubs
      .filter((s) => s.module.id === currentModule.id)
      .at(-1)?.sub.full_id === completedSubmoduleId;

  const completedSub = allSubs[currentIdx]?.sub;

  // Completion message hierarchy
  let title = "Tarea completada";
  let subtitle = completedSub?.title ?? "";

  if (isLastInCourse) {
    title = "Proyecto completado";
    subtitle = course.meta.title;
  } else if (isLastInModule) {
    title = "Modulo completado";
    subtitle = currentModule?.title ?? "";
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-overlayIn"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); dismissSuccess(); } }}
    >
      <div className="relative w-full max-w-sm mx-4 text-center">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 -inset-x-16"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(78, 201, 176, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* Animated checkmark */}
        <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-success/30 bg-success/[0.08]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-8 w-8 text-success"
            aria-hidden="true"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-checkDraw"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animationDelay: "100ms",
              }}
            />
          </svg>
        </div>

        <h3 className="relative text-xl font-semibold tracking-tight text-text">{title}</h3>
        <p className="relative mt-1.5 text-sm text-text-muted">{subtitle}</p>

        <div className="relative mt-8 flex flex-col items-center gap-3">
          {isLastInCourse ? (
            <a
              href="/courses"
              className="rounded-full bg-primary px-7 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Ver otros proyectos
            </a>
          ) : (
            <button
              onClick={handleContinue}
              className="rounded-full bg-primary px-7 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              autoFocus
            >
              Siguiente tarea →
            </button>
          )}

          <button
            onClick={handleSkip}
            className="text-xs text-text-dim hover:text-text-muted transition-colors"
          >
            Omitir celebraciones
          </button>
        </div>
      </div>
    </div>
  );
}
