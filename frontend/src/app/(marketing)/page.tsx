import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProjectShowcase } from "@/components/marketing/project-showcase";
import { Manifesto } from "@/components/marketing/manifesto";
import { CareerValue } from "@/components/marketing/career-value";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { OverdriveBackground } from "@/components/marketing/overdrive-background";
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
      <OverdriveBackground />
      <Hero />
      <HowItWorks />
      <ScrollReveal>
        <ProjectShowcase courses={courses} />
      </ScrollReveal>
      <ScrollReveal>
        <Manifesto />
      </ScrollReveal>
      <CareerValue />
      <PricingTeaser />
    </>
  );
}
