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
        <section className="pt-16 pb-12 md:pt-24 md:pb-20 border-b-4 border-text mb-16 px-2">
          <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-none border-2 border-primary bg-surface px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-primary mb-6 shadow-[4px_4px_0px_rgba(var(--color-primary-rgb),0.2)]">
                <span className="flex h-2 w-2 bg-primary" />
                <span>Vol. I · Catálogo de Ingeniería</span>
              </div>
              <h1 className="mt-4 text-5xl font-black leading-[1] tracking-tighter sm:text-6xl md:text-[72px] lg:text-[80px] uppercase italic">
                Retos de sistemas,{" "}
                <span className="text-primary not-italic block mt-2 lowercase">escritos para builders.</span>
              </h1>
              <p className="mt-10 max-w-xl text-lg leading-relaxed text-text font-bold border-l-4 border-primary pl-8">
                Replica problemas reales: especificación, entorno y pruebas que no perdonan. 
                Elige uno y escribe código real.
              </p>
            </div>
            {/* Meta slab — Sharp, Technical */}
            <aside className="min-w-[14rem] border-4 border-text bg-surface p-8 rounded-none shadow-[8px_8px_0px_rgba(var(--color-primary-rgb),0.1)] hidden md:block">
              <dl className="space-y-4">
                <div className="flex items-center justify-between gap-6 border-b-2 border-border pb-2">
                  <dt className="font-mono text-[10px] font-black uppercase tracking-widest text-text-dim">Proyectos</dt>
                  <dd className="tabular-nums text-text font-black text-lg">
                    {String(count).padStart(2, "0")}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-6 border-b-2 border-border pb-2">
                  <dt className="font-mono text-[10px] font-black uppercase tracking-widest text-text-dim">Formato</dt>
                  <dd className="text-text font-black text-[12px] uppercase tracking-tighter">Raw TCP/OS</dd>
                </div>
                <div className="flex items-center justify-between gap-6 border-b-2 border-border pb-2">
                  <dt className="font-mono text-[10px] font-black uppercase tracking-widest text-text-dim">Validación</dt>
                  <dd className="text-text font-black text-[12px] uppercase tracking-tighter">CI Artifacts</dd>
                </div>
                <div className="flex items-center justify-between gap-6 pt-1">
                  <dt className="font-mono text-[10px] font-black uppercase tracking-widest text-text-dim">Status</dt>
                  <dd className="flex items-center gap-2 text-text font-black text-[12px] uppercase tracking-tighter">
                    <span className="h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                    Live
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <div className="my-16">
          {count === 0 ? (
            <div className="rounded-none border-4 border-text bg-surface px-8 py-20 md:px-12 text-left flex flex-col items-start shadow-[12px_12px_0px_rgba(var(--color-border-rgb),0.1)]">
              <div className="inline-flex items-center gap-2 rounded-none bg-primary/20 border-2 border-primary/40 px-4 py-1.5 text-[12px] font-black uppercase tracking-[0.1em] text-text mb-8">
                En prensa
              </div>
              <p className="font-serif text-5xl italic leading-none text-text font-black uppercase tracking-tighter max-w-2xl">
                Los primeros expedientes técnicos están en camino.
              </p>
              <p className="mt-8 max-w-xl text-[18px] leading-relaxed text-text-muted font-bold border-l-4 border-primary pl-8">
                El sistema de provisionamiento está siendo calibrado. 
                Vuelve pronto para el despliegue inicial.
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
