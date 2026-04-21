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
          href="/courses"
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
            href="/courses"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft size={13} />
            Indice
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-14 pb-24">
        {/* Masthead */}
        <div className="flex items-center justify-between border-b border-border pb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
          <span>
            Proyecto No. {courseNo} &nbsp;/&nbsp; {firstVariant.language}
          </span>
          <span>{firstVariant.difficulty}</span>
        </div>

        {/* Hero — editorial display type, no image placeholder */}
        <section className="grid grid-cols-1 gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div className="min-w-0">
            <h1 className="font-serif text-5xl leading-[1.04] tracking-tight text-text sm:text-6xl md:text-[76px]">
              {firstVariant.title}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-[1.65] text-text-muted">
              {firstVariant.description}
            </p>

            <div className="mt-12 max-w-xl">
              <div className="mb-4 flex items-baseline justify-between gap-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                  Enrolar
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                  {languages.length}{" "}
                  {languages.length === 1 ? "lenguaje" : "lenguajes"}
                </span>
              </div>
              <LanguagePicker courseId={courseId} languages={languages} />
              <p className="mt-4 max-w-md text-xs leading-relaxed text-text-dim">
                Mismo proyecto, diferente lenguaje. Tu editor, pruebas
                automatizadas y entorno listo desde el primer commit.
              </p>
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
              href="/courses"
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
