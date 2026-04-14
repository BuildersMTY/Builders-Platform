"use client";

import { useRouter } from "next/navigation";
import { enroll } from "@/lib/api";
import { useState } from "react";

interface LanguageOption {
  lang: string;
  enrolled: boolean;
  progress?: { completed: number; total: number };
}

interface LanguagePickerProps {
  courseId: string;
  languages: LanguageOption[];
}

export function LanguagePicker({ courseId, languages }: LanguagePickerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(lang: string, enrolled: boolean) {
    if (enrolled) {
      router.push(`/workspace/${courseId}/${lang}`);
      return;
    }
    setLoading(lang);
    try {
      await enroll(courseId, lang);
      router.push(`/workspace/${courseId}/${lang}`);
    } catch (err) {
      router.push(`/workspace/${courseId}/${lang}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {languages.map((opt) => (
        <button
          key={opt.lang}
          onClick={() => handleSelect(opt.lang, opt.enrolled)}
          disabled={loading !== null}
          className="flex flex-col rounded-xl border border-border bg-surface p-7 text-left transition-all duration-200 hover:border-primary/30 disabled:opacity-50"
        >
          <span className="text-xl font-bold capitalize tracking-tight">{opt.lang}</span>
          {opt.enrolled && opt.progress ? (
            <div className="mt-4 w-full">
              <div className="flex justify-between text-xs text-text-muted">
                <span>{opt.progress.completed}/{opt.progress.total} submodulos</span>
                <span>{Math.round((opt.progress.completed / opt.progress.total) * 100)}%</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-surface-hover">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(opt.progress.completed / opt.progress.total) * 100}%` }} />
              </div>
              <span className="mt-4 inline-block text-sm font-medium text-primary">Continuar</span>
            </div>
          ) : (
            <span className="mt-4 text-sm text-text-muted">{loading === opt.lang ? "Inscribiendo..." : "Comenzar"}</span>
          )}
        </button>
      ))}
    </div>
  );
}
