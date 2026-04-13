import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { CourseSummary } from "@/lib/types";

interface CourseCardProps {
  course: CourseSummary;
  progress?: { lang: string; completed: number; total: number } | null;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="group rounded-xl border border-border bg-surface p-6 transition-colors duration-150 hover:border-text-dim cursor-pointer">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{course.title}</h3>
          <Badge variant="primary">{course.difficulty}</Badge>
        </div>
        <p className="mt-2 text-sm text-text-muted line-clamp-2">{course.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <Badge>{course.language}</Badge>
        </div>
        {progress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{progress.lang} — {progress.completed}/{progress.total}</span>
              <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-surface-hover">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
