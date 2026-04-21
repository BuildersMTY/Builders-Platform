import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProjectShowcase } from "@/components/marketing/project-showcase";
import { Manifesto } from "@/components/marketing/manifesto";
import { CareerValue } from "@/components/marketing/career-value";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
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
      {/* Hero owns the only orchestrated entrance motion. */}
      <Hero />

      {/* Method — no reveal wrapper; lives as the natural next spread. */}
      <HowItWorks />

      {/* Project index — subtle reveal; it's the "what's on offer" moment. */}
      <ScrollReveal>
        <ProjectShowcase courses={courses} />
      </ScrollReveal>

      {/* Manifesto — editorial pull quote. The one place the voice speaks. */}
      <ScrollReveal>
        <Manifesto />
      </ScrollReveal>

      {/* Value bands each reveal internally. */}
      <CareerValue />

      {/* Closing move — no reveal, full presence. */}
      <PricingTeaser />
    </>
  );
}
