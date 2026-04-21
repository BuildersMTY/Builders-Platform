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
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-text-muted mb-4">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                <span>Vol. I · Proyectos</span>
              </div>
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
            <aside className="hidden min-w-[12rem] border-l border-border pl-6 text-[13px] font-medium md:block">
              <dl className="space-y-4 text-text-muted">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-text-dim">Proyectos</dt>
                  <dd className="tabular-nums text-text font-semibold">
                    {String(count).padStart(2, "0")}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-text-dim">Formato</dt>
                  <dd className="text-text font-semibold">Práctico</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-text-dim">Rigor</dt>
                  <dd className="text-text font-semibold">Unit Tested</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                  <dt className="text-text-dim">Status</dt>
                  <dd className="flex items-center gap-2 text-text font-semibold">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.6)]" />
                    En vivo
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <div className="my-10">
          {count === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-8 py-16 md:px-12 text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-surface-alt px-3 py-1 text-[12px] font-medium text-text-muted mb-6">
                En prensa
              </div>
              <p className="font-serif text-3xl italic leading-snug text-text">
                Los primeros proyectos entran a imprenta.
              </p>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-text-muted">
                Editor completo, pruebas automatizadas y entorno listo desde el primer commit.
                Vuelve pronto — o sigue construyendo.
              </p>
            </div>
          ) : (
            <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, i) => (
                <li key={course.slug} className="flex">
                  <CourseCard course={course} index={i} />
                </li>
              ))}
            </ol>
          )}
        </div>

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
