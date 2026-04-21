import Link from "next/link";
import type { CourseSummary } from "@/lib/types";

interface CourseCardProps {
  course: CourseSummary;
  index: number;
  progress?: { lang: string; completed: number; total: number } | null;
}

// A row in the course index. Editorial hierarchy, not a card rectangle:
// leading serif numeral, sans title, mono metadata right-aligned.
// Hover lifts the row background and glints the numeral red.
export function CourseCard({ course, index, progress }: CourseCardProps) {
  const hours = course.estimated_hours;
  const hoursRange =
    hours && hours.junior && hours.senior
      ? `${hours.senior}–${hours.junior}h`
      : hours?.junior
        ? `${hours.junior}h`
        : null;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <div className="flex items-start justify-between mb-4">
        {/* Beautiful cursive numeral kept for elegance, bounded in a SaaS container context */}
        <span
          aria-hidden
          className="font-serif text-3xl italic leading-none tabular-nums text-text-dim transition-colors duration-300 group-hover:text-primary"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        
        {/* Dynamic difficulty badge */}
        <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
          course.difficulty === 'hard' 
            ? 'bg-red-500/10 text-red-500' 
            : course.difficulty === 'medium'
            ? 'bg-orange-500/10 text-orange-500'
            : 'bg-green-500/10 text-green-500'
        }`}>
          {course.difficulty}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold tracking-tight text-text transition-colors duration-300 group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-text-muted">
          {course.description}
        </p>
      </div>

      {/* Progress & Metadata */}
      <div className="mt-8">
        {progress && progress.total > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-[12px] font-medium text-text-muted">
              <span>{progress.lang}</span>
              <span>{progress.completed} / {progress.total}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.round((progress.completed / progress.total) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-[13px] font-medium text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-text-dim">code</span>
            {course.language}
          </div>
          {hoursRange && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-text-dim">schedule</span>
              {hoursRange}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
