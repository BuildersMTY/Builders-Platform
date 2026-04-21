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
      className="group relative flex w-full flex-col overflow-hidden rounded-none border-2 border-text bg-surface p-10 transition-all duration-300 hover:border-primary hover:shadow-[12px_12px_0px_rgba(var(--color-primary-rgb),0.2)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary hover:-translate-y-1"
    >
      {/* Structural Numeral — Large, sharp */}
      <div className="absolute top-0 right-0 p-8 opacity-10 transition-all duration-500 group-hover:opacity-20 group-hover:scale-110">
        <span className="font-serif text-[100px] font-black italic leading-none tabular-nums text-text">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-primary">
            PROYECTO {String(index + 1).padStart(2, "0")}
          </span>
          <div className="h-[2px] w-12 bg-primary" />
        </div>
        
        {/* Difficulty — Sharp Badge */}
        <div className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border-2 ${
          course.difficulty === 'hard' 
            ? 'border-red-500/60 bg-red-500/5 text-red-500/80' 
            : course.difficulty === 'medium'
            ? 'border-orange-500/60 bg-orange-500/5 text-orange-500/80'
            : 'border-green-500/60 bg-green-500/5 text-green-500/80'
        }`}>
          {course.difficulty}
        </div>
      </div>

      {/* Body — High Impact Typography */}
      <div className="flex-1 relative z-10">
        <h3 className="text-3xl font-black leading-[1.1] tracking-tighter text-text transition-colors duration-300 group-hover:text-primary mb-4 uppercase">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-[15px] leading-relaxed text-text-muted/90 font-bold border-l-2 border-border pl-5 group-hover:border-primary/60 transition-colors">
          {course.description}
        </p>
      </div>

      {/* Progress & Metadata — Concise and Technical */}
      <div className="mt-10 relative z-10">
        {progress && progress.total > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] font-black uppercase tracking-widest text-text-dim">
              <span>{progress.lang} / STACK</span>
              <span className="text-primary">{Math.round((progress.completed / progress.total) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-border/20 p-[2px] rounded-none border border-border/40">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out shadow-[4px_0_12px_rgba(var(--color-primary-rgb),0.4)]"
                style={{
                  width: `${Math.min(100, Math.round((progress.completed / progress.total) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-x-8 border-t-2 border-border pt-8 font-mono text-[11px] font-black uppercase tracking-widest text-text-dim group-hover:text-text-muted transition-colors">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">terminal</span>
            {course.language}
          </div>
          {hoursRange && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
              {hoursRange}
            </div>
          )}
          <div className="ml-auto opacity-0 translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
             <span className="material-symbols-outlined text-[24px] text-primary font-black">arrow_right_alt</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
