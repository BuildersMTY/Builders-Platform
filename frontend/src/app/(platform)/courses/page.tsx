import { fetchCoursesServer } from "@/lib/api";
import { CourseCard } from "@/components/courses/course-card";
import Link from "next/link";
import Image from "next/image";

export default async function CoursesPage() {
  const courses = await fetchCoursesServer();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/builderslogo2.svg" alt="Buildmancer" width={28} height={28} />
            <span className="font-bold">Buildmancer</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 pt-16 pb-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="font-serif italic text-primary">Proyectos</span> que construyen carrera
          </h1>
          <p className="mt-4 text-lg text-text-muted leading-relaxed">
            Cada proyecto replica un reto real de ingeniería. Elige uno, escribe código, y demuestra lo que sabes.
          </p>
        </div>
        {courses.length === 0 ? (
          <div className="mt-20 max-w-md">
            <p className="text-lg font-medium text-text-muted">Proyectos en camino.</p>
            <p className="mt-2 text-sm text-text-dim leading-relaxed">
              Los primeros proyectos se publican pronto. Editor completo, pruebas automatizadas y entorno listo para escribir código desde el día uno.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
