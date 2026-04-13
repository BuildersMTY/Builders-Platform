import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseSummary } from "@/lib/types";

interface ProjectShowcaseProps {
  courses: CourseSummary[];
}

export function ProjectShowcase({ courses }: ProjectShowcaseProps) {
  return (
    <section id="proyectos" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Proyectos</h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-text-muted">
          Construye lo que los ingenieros de software construyen en el mundo real.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.slug} hover>
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="mt-2 text-sm text-text-muted line-clamp-2">{course.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{course.language}</Badge>
                <Badge variant="primary">{course.difficulty}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
