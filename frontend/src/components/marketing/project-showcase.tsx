import type { CourseSummary } from "@/lib/types";

const LANG_ACCENTS: Record<string, string> = {
  go: "from-[#00ADD8]/[0.10]",
  python: "from-[#3776AB]/[0.10]",
  javascript: "from-[#F7DF1E]/[0.07]",
  typescript: "from-[#3178C6]/[0.10]",
  rust: "from-[#CE422B]/[0.10]",
};

interface ProjectShowcaseProps {
  courses: CourseSummary[];
}

export function ProjectShowcase({ courses }: ProjectShowcaseProps) {
  if (courses.length === 0) return null;

  return (
    <section id="proyectos" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-widest text-text-dim">
          Proyectos
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          Lo que <span className="font-serif italic text-primary">construirás</span>
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {courses.map((course, i) => {
            const accent =
              LANG_ACCENTS[course.language.toLowerCase()] ||
              "from-primary/[0.07]";
            return (
              <div
                key={course.slug}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${accent} to-transparent p-8 transition-all duration-500 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20 ${
                  i === 0 ? "md:col-span-2 md:p-10" : ""
                }`}
              >
                <p className="text-[11px] font-medium uppercase tracking-widest text-text-dim">
                  {course.language} · {course.difficulty}
                </p>
                <h3
                  className={`mt-2 font-semibold tracking-tight transition-colors group-hover:text-primary ${
                    i === 0 ? "text-2xl md:text-3xl" : "text-xl"
                  }`}
                >
                  {course.title}
                </h3>
                <p
                  className={`mt-3 text-sm leading-relaxed text-text-muted ${
                    i === 0 ? "max-w-xl" : "line-clamp-2"
                  }`}
                >
                  {course.description}
                </p>
                <div className="mt-6 flex items-center">
                  <span className="text-xs font-medium text-text-dim transition-colors group-hover:text-primary">
                    Comenzar proyecto
                  </span>
                  <span className="ml-1.5 text-text-dim transition-all group-hover:translate-x-1 group-hover:text-primary">
                    &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
