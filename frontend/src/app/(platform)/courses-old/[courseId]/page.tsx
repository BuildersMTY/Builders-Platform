import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LanguagePicker } from "@/components/courses/language-picker";
import { DetailDossier } from "@/components/courses/detail-dossier";
import { DetailModules } from "@/components/courses/detail-modules";
import {
  fetchCoursesServer,
  fetchCourseServer,
  fetchProgressServer,
} from "@/lib/api";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const courses = await fetchCoursesServer();
  const courseVariants = courses.filter((c) => c.slug === courseId);

  if (courseVariants.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
          404 / not found
        </span>
        <p className="font-serif text-2xl italic text-text">
          Proyecto no encontrado.
        </p>
        <Link
          href="/courses-old"
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted hover:text-text"
        >
          &larr; volver al indice
        </Link>
      </div>
    );
  }

  const firstVariant = courseVariants[0];

  // Full course (with modules) for the first variant — drives the scope section.
  // Fallback to an empty modules array if the detailed fetch fails.
  let courseDetail = null as Awaited<
    ReturnType<typeof fetchCourseServer>
  > | null;
  try {
    courseDetail = await fetchCourseServer(courseId, firstVariant.language);
  } catch {
    courseDetail = null;
  }

  const modules = courseDetail?.modules ?? [];
  const submoduleCount = modules.reduce(
    (acc, m) => acc + m.submodules.length,
    0
  );
  const totalUnits = submoduleCount || 7;

  const languages = await Promise.all(
    courseVariants.map(async (variant) => {
      const progress = await fetchProgressServer(courseId, variant.language);
      return {
        lang: variant.language,
        enrolled: progress !== null,
        progress: progress
          ? { completed: progress.passed.length, total: totalUnits }
          : undefined,
      };
    })
  );

  const courseNo = courseIndex(courses.map((c) => c.slug), courseId);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/builderslogo2.svg"
              alt="Buildmancer"
              width={28}
              height={28}
            />
            <span className="font-bold">Buildmancer</span>
          </Link>
          <Link
            href="/courses-old"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft size={13} />
            Indice
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-20 pb-32">
        {/* Masthead — Sharp, Heavy Borders */}
        <div className="flex items-center justify-between border-b-2 border-text/80 pb-6 mb-16">
          <div className="flex items-center gap-4 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <span className="flex h-6 w-14 items-center justify-center bg-primary/20 text-text font-black border-2 border-primary/40">
              #{courseNo}
            </span>
            <span className="text-text-dim uppercase tracking-widest">Dossier de Proyecto {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
            <div className="h-3 w-3 bg-green-500/60 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            {firstVariant.difficulty}
          </div>
        </div>

        {/* Hero — Sharp Scale, Brutalist Impact */}
        <section className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-24">
          <div className="min-w-0">
            <h1 className="font-serif text-5xl leading-[1] tracking-tighter text-text sm:text-6xl md:text-[72px] lg:text-[84px] font-black uppercase italic">
              {firstVariant.title.split(' ').map((word, i) => (
                <span key={i} className={i % 3 === 1 ? "text-primary not-italic" : ""}>
                   {word}{' '}
                </span>
              ))}
            </h1>
            
            <div className="mt-12 h-[3px] w-24 bg-primary" />
            
            <p className="mt-10 max-w-xl text-xl leading-[1.6] text-text-muted/90 font-bold border-l-4 border-primary/40 pl-8">
              {firstVariant.description}
            </p>

            <div className="mt-20 max-w-xl border-2 border-text bg-surface p-12 rounded-none shadow-[12px_12px_0px_rgba(var(--color-primary-rgb),0.05)]">
              <div className="mb-8 flex items-center justify-between gap-6">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-text">
                  Protocolo de Enrolamiento
                </span>
                <div className="h-[2px] flex-1 bg-border" />
              </div>
              <LanguagePicker courseId={courseId} languages={languages} />
              <div className="mt-12 flex items-start gap-5 bg-bg p-8 border-2 border-border rounded-none shadow-inner">
                <span className="material-symbols-outlined text-primary text-[24px] font-black">info</span>
                <p className="text-[14.5px] leading-[1.6] text-text-muted font-bold italic">
                   Entorno de ingeniería real. Al enrolarte, se provisionará un repositorio privado y un entorno de ejecución dedicado para el proyecto.
                </p>
              </div>
            </div>
          </div>

          {courseDetail && (
            <DetailDossier
              meta={courseDetail.meta}
              languages={courseVariants.map((v) => v.language)}
              moduleCount={modules.length}
              submoduleCount={submoduleCount}
            />
          )}
        </section>

        {/* Scope — magazine-style table of contents */}
        {modules.length > 0 && (
          <section className="mt-24 max-w-4xl">
            <DetailModules modules={modules} />
          </section>
        )}

        {/* Closing rail — quiet, confident */}
        <section className="mt-24 border-t border-border pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="max-w-xl font-serif text-xl italic leading-snug text-text">
              Esto no es un tutorial. Es un proyecto real con pruebas reales.
            </p>
            <Link
              href="/courses-old"
              className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-text"
            >
              <ArrowLeft size={13} />
              Otros proyectos
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

// Zero-padded issue number derived from the course's position in the unique slug list.
function courseIndex(allSlugs: string[], slug: string): string {
  const unique = Array.from(new Set(allSlugs));
  const idx = unique.indexOf(slug);
  const n = idx >= 0 ? idx + 1 : 1;
  return String(n).padStart(2, "0");
}
