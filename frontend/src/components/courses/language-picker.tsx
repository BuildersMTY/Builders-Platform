"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { enroll } from "@/lib/api";

export interface LanguageOption {
  lang: string;
  enrolled: boolean;
  progress?: { completed: number; total: number };
}

interface LanguagePickerProps {
  courseId: string;
  languages: LanguageOption[];
}

// Segmented language selector + single decisive CTA.
// - Segmented control (not a <select>), monospace, mechanical.
// - One red element on the page: the Comenzar / Continuar button.
export function LanguagePicker({ courseId, languages }: LanguagePickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(languages[0]?.lang ?? "");
  const [loading, setLoading] = useState(false);

  const active = languages.find((l) => l.lang === selected) ?? languages[0];
  if (!active) return null;

  const label = active.enrolled ? "Continuar" : "Comenzar a construir";

  async function handleGo() {
    if (!active) return;
    if (active.enrolled) {
      router.push(`/workspace/${courseId}/${active.lang}`);
      return;
    }
    setLoading(true);
    try {
      await enroll(courseId, active.lang);
    } catch {
      // enrollment may already exist — proceed regardless
    } finally {
      router.push(`/workspace/${courseId}/${active.lang}`);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Lenguaje"
        className="inline-flex w-full flex-wrap items-stretch gap-0 overflow-hidden rounded-md border border-border bg-surface/60 p-0.5"
      >
        {languages.map((opt) => {
          const isActive = opt.lang === selected;
          return (
            <button
              key={opt.lang}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelected(opt.lang)}
              className={[
                "relative flex-1 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-150",
                isActive
                  ? "bg-surface-hover text-text"
                  : "text-text-dim hover:text-text",
              ].join(" ")}
            >
              <span className="flex items-center justify-center gap-2">
                <span>{opt.lang}</span>
                {opt.enrolled && opt.progress && (
                  <span
                    className={[
                      "font-mono text-[10px] tabular-nums tracking-normal",
                      isActive ? "text-text-muted" : "text-text-dim",
                    ].join(" ")}
                  >
                    {opt.progress.completed}/{opt.progress.total}
                  </span>
                )}
              </span>
              {isActive && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 -bottom-px h-px bg-text/50"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleGo}
          disabled={loading}
          className="group inline-flex items-center gap-3 bg-primary px-6 py-3.5 font-sans text-sm font-medium text-text transition-all duration-150 hover:bg-primary-hover disabled:opacity-60"
        >
          <span>{loading ? "Inscribiendo..." : label}</span>
          <span
            aria-hidden
            className="font-mono text-xs tracking-tight transition-transform duration-200 group-hover:translate-x-0.5"
          >
            &rarr;
          </span>
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim">
          en {active.lang}
          {active.enrolled && active.progress && (
            <span className="ml-2 text-text-muted">
              &middot; {active.progress.completed}/{active.progress.total} submodulos
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
