import { fetchCoursesServer } from "@/lib/api";
import { CourseCard } from "@/components/courses/course-card";
import Link from "next/link";
import Image from "next/image";

export default async function CoursesPage() {
  const courses = await fetchCoursesServer();

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
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <p className="mt-2 text-text-muted">Elige un proyecto y empieza a construir.</p>
        {courses.length === 0 ? (
          <div className="mt-12 text-center text-text-muted">
            <p>No hay proyectos disponibles todavía.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
