import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProjectShowcase } from "@/components/marketing/project-showcase";
import { CareerValue } from "@/components/marketing/career-value";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import Link from "next/link";
import type { CourseSummary } from "@/lib/types";

async function getCourses(): Promise<CourseSummary[]> {
  try {
    const res = await fetch("http://localhost:8000/api/courses", {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const courses = await getCourses();

  return (
    <>
      <Hero />
      <HowItWorks />
      <ProjectShowcase courses={courses} />
      <CareerValue />
      <PricingTeaser />

      <section className="px-6 py-24 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Deja de practicar en el vacío</h2>
        <p className="mt-4 text-text-muted">Empieza a construir software que importa.</p>
        <div className="mt-8">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary-hover transition-colors duration-150"
          >
            Empieza a construir
          </Link>
        </div>
      </section>
    </>
  );
}
