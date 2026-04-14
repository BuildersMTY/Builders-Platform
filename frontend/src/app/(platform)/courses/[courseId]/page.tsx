import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LanguagePicker } from "@/components/courses/language-picker";
import { fetchCoursesServer, fetchProgressServer } from "@/lib/api";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;
  const courses = await fetchCoursesServer();
  const courseVariants = courses.filter((c) => c.slug === courseId);

  if (courseVariants.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Proyecto no encontrado.</p>
      </div>
    );
  }

  const firstVariant = courseVariants[0];

  const languages = await Promise.all(
    courseVariants.map(async (variant) => {
      const progress = await fetchProgressServer(courseId, variant.language);
      return {
        lang: variant.language,
        enrolled: progress !== null,
        progress: progress ? { completed: progress.passed.length, total: 7 } : undefined,
      };
    })
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/builderslogo2.svg" alt="Buildmancer" width={28} height={28} />
            <span className="font-bold">Buildmancer</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={16} />
          Proyectos
        </Link>
        <div className="mt-10">
          <div className="flex items-start gap-4">
            <h1 className="text-4xl font-bold tracking-tight">{firstVariant.title}</h1>
            <Badge variant="primary" className="mt-2 shrink-0">
              <span className="font-serif italic">{firstVariant.difficulty}</span>
            </Badge>
          </div>
          <p className="mt-4 text-lg text-text-muted leading-relaxed max-w-xl">{firstVariant.description}</p>
        </div>
        <div className="mt-14">
          <h2 className="text-xl font-semibold">
            Elige <span className="font-serif italic text-primary">tu</span> lenguaje
          </h2>
          <p className="mt-2 text-sm text-text-muted">Mismo proyecto, diferente lenguaje. Tú decides.</p>
          <div className="mt-8">
            <LanguagePicker courseId={courseId} languages={languages} />
          </div>
        </div>
      </main>
    </div>
  );
}
