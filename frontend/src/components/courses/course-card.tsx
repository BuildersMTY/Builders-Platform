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
      className="group relative block border-b border-border transition-colors duration-200 hover:bg-surface-alt/60 focus-visible:bg-surface-alt/60"
    >
      <div className="grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-6 px-4 py-6 md:gap-10 md:px-6 md:py-7">
        {/* Leading numeral — editorial index */}
        <span
          aria-hidden
          className="font-serif text-3xl italic leading-none tabular-nums text-text-dim transition-colors duration-200 group-hover:text-primary md:text-4xl"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Body: title + slug + description */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <h3 className="truncate text-lg font-medium tracking-tight text-text md:text-xl">
              {course.title}
            </h3>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim md:inline">
              / {course.slug}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-text-muted">
            {course.description}
          </p>

          {progress && progress.total > 0 && (
            <div className="mt-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim">
              <span>
                {progress.lang} · {progress.completed}/{progress.total}
              </span>
              <span className="h-px flex-1 max-w-[6rem] bg-border">
                <span
                  className="block h-full bg-primary"
                  style={{
                    width: `${Math.min(100, Math.round((progress.completed / progress.total) * 100))}%`,
                  }}
                />
              </span>
            </div>
          )}
        </div>

        {/* Metadata rail — mono, right-aligned, terse. Column labels
            live in the list header above, so only values here. */}
        <dl className="hidden min-w-[14rem] grid-cols-3 items-baseline gap-x-6 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-text md:grid">
          <div>
            <dt className="sr-only">Language</dt>
            <dd>{course.language}</dd>
          </div>
          <div>
            <dt className="sr-only">Difficulty</dt>
            <dd>{course.difficulty}</dd>
          </div>
          <div>
            <dt className="sr-only">Estimated hours</dt>
            <dd>{hoursRange ?? "—"}</dd>
          </div>
        </dl>

        {/* Mobile metadata — inline chips under body */}
        <div className="col-span-2 col-start-2 -mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted md:hidden">
          <span>{course.language}</span>
          <span className="text-text-dim">·</span>
          <span>{course.difficulty}</span>
          {hoursRange && (
            <>
              <span className="text-text-dim">·</span>
              <span>{hoursRange}</span>
            </>
          )}
        </div>
      </div>

      {/* Affordance: arrow glyph on hover, tucked in right gutter */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 font-mono text-xs text-text-dim opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:right-4"
      >
        →
      </span>
    </Link>
  );
}
