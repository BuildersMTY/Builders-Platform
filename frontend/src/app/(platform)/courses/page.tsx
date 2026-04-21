import { fetchCoursesServer } from "@/lib/api";
import { CourseCard } from "@/components/courses/course-card";
import Link from "next/link";
import Image from "next/image";

export default async function CoursesPage() {
  const courses = await fetchCoursesServer();
  const count = courses.length;

  return (
    <div className="min-h-screen">
      {/* Chrome — tight, tool-like. Not a marketing header. */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/builderslogo2.svg" alt="Buildmancer" width={22} height={22} />
            <span className="text-sm font-semibold tracking-tight">Buildmancer</span>
          </Link>
          <nav className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
            <span className="text-text">Index</span>
            <span className="text-text-dim">·</span>
            <span>Catálogo {new Date().getFullYear()}</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Editorial masthead — serif italic for the opinionated word,
            sans for plainspoken structure. Kept tighter than marketing. */}
        <section className="pt-14 pb-10 md:pt-20 md:pb-12">
          <div className="flex items-start justify-between gap-10">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim">
                Vol. I · Proyectos
              </p>
              <h1 className="mt-4 text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl">
                Retos de ingeniería,{" "}
                <span className="font-serif italic text-primary">escritos para builders</span>.
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-text-muted">
                Cada entrada replica un problema real: especificación, entorno, y pruebas que no
                perdonan. Elige uno y escribe código. Sin tutoriales, sin relleno.
              </p>
            </div>
            {/* Meta slab — catalog density, quiet but factual */}
            <aside className="hidden min-w-[12rem] border-l border-border pl-6 font-mono text-[11px] uppercase tracking-[0.14em] md:block">
              <dl className="space-y-3 text-text-muted">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-text-dim">entries</dt>
                  <dd className="tabular-nums text-text">
                    {String(count).padStart(2, "0")}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-text-dim">format</dt>
                  <dd className="text-text">Project</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-text-dim">rigor</dt>
                  <dd className="text-text">Tested</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-text-dim">live</dt>
                  <dd className="flex items-center gap-1.5 text-text">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    on
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {/* Column header — aligns with the CourseCard grid. */}
        <div className="border-t border-b border-border bg-surface/40">
          <div className="grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-6 px-4 py-3 md:gap-10 md:px-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
              №
            </span>
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
              <span>Project</span>
              <span className="h-px flex-1 bg-border" />
              <span className="tabular-nums">
                {count} {count === 1 ? "entry" : "entries"}
              </span>
            </div>
            <dl className="hidden min-w-[14rem] grid-cols-3 gap-x-6 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim md:grid">
              <span>lang</span>
              <span>level</span>
              <span>est</span>
            </dl>
          </div>
        </div>

        {/* The index itself, or an empty state with the same typographic voice. */}
        {count === 0 ? (
          <div className="border-b border-border px-4 py-16 md:px-6">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim">
                Estado · En prensa
              </p>
              <p className="mt-4 font-serif text-2xl italic leading-snug text-text">
                Los primeros proyectos entran a imprenta.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                Editor completo, pruebas automatizadas y entorno listo desde el primer commit.
                Vuelve pronto — o sigue construyendo.
              </p>
            </div>
          </div>
        ) : (
          <ol className="divide-border">
            {courses.map((course, i) => (
              <li key={course.slug}>
                <CourseCard course={course} index={i} />
              </li>
            ))}
          </ol>
        )}

        {/* Colophon — tiny, editorial sign-off. Keeps the page feeling finished. */}
        <footer className="mt-20 border-t border-border py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
            Fin del índice · Buildmancer
          </p>
        </footer>
      </main>
    </div>
  );
}
