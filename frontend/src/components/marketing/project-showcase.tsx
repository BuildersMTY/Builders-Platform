import Link from "next/link";
import type { CourseSummary } from "@/lib/types";
import { CourseCard } from "@/components/courses/course-card";

interface ProjectShowcaseProps {
  courses: CourseSummary[];
}


export function ProjectShowcase({ courses }: ProjectShowcaseProps) {
  if (courses.length === 0) return null;

  return (
    <section id="proyectos" className="px-6 py-28 md:py-36">
      <div className="mx-auto max-w-[1200px]">
        {/* Section head — wide, asymmetric */}
          <h2
            className="col-span-12 mt-6 font-semibold tracking-tighter md:col-span-10"
            style={{
              fontSize: "clamp(3.5rem, 1rem + 10vw, 11rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.05em",
            }}
          >
            Problemas que se{" "}
            <span className="font-serif italic text-primary block md:inline">resuelven en producción.</span>
          </h2>

        {/* Ruled index converted to CourseCard structural grid */}
        <div className="relative mt-20">
          {/* HUD BACKGROUND EFFECT */}
          <div className="absolute -inset-10 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.03)_0%,transparent_70%)] opacity-50" />
          
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <li key={course.slug} className="flex">
                <CourseCard course={course} index={i} />
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-baseline gap-4">
          <p className="font-mono text-[11px] tracking-widest text-primary uppercase font-bold">
            [ ADD_MORE_MONTHLY=TRUE ]
          </p>
          <p className="max-w-xs font-mono text-[10px] uppercase text-text-dim leading-relaxed">
            Sugerencias de especificación abiertas. Todas las naves deben pasar las pruebas de integración.
          </p>
        </div>
      </div>
    </section>
  );
}
