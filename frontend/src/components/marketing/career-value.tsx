import { ScrollReveal } from "./scroll-reveal";
import { CourseSnippetCard } from "@/components/courses/course-snippet-card";

interface ValueBandProps {
  index: string;
  kicker: string;
  heading: string;
  accent: string;
  description: string;
  align: "left" | "right";
  snippet: {
    title: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    icon: string;
    slug: string;
  };
}

function ValueBand({
  index,
  kicker,
  heading,
  accent,
  description,
  align,
  snippet
}: ValueBandProps) {
  return (
    <div className="border-t border-border px-6 py-20 md:py-32">
      <div className="mx-auto grid max-w-[1200px] grid-cols-12 gap-y-12 md:gap-y-0 md:gap-x-12 items-center">
        
        {/* TEXT CONTENT */}
        <div className={`col-span-12 md:col-span-7 ${align === "right" ? "md:order-2" : "md:order-1"}`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-dim mb-6">
            <span className="text-primary font-bold">{index}</span>{" "}
            <span className="ml-2">{kicker}</span>
          </p>

          <h3
            className="font-semibold tracking-tighter"
            style={{
              fontSize: "clamp(2.5rem, 1rem + 4vw, 4.75rem)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {heading}{" "}
            <span className="font-serif italic text-primary">{accent}</span>
          </h3>

          <p
            className="mt-8 max-w-md text-[16px] text-text-muted leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* ASYMMETRIC SNIPPET */}
        <div className={`col-span-12 md:col-span-5 flex ${align === "left" ? "md:justify-end md:order-2" : "md:justify-start md:order-1"}`}>
          <CourseSnippetCard {...snippet} />
        </div>
      </div>
    </div>
  );
}

export function CareerValue() {
  return (
    <section>
      <ScrollReveal>
        <ValueBand
          index="01"
          kicker="Fuerza Bruta"
          heading="Músculo"
          accent="real."
          description="Demuestra que tus manos saben construir lo que otros solo saben pedirle a un prompt. Mientras la IA genera scripts, tú construyes sistemas. Sin muletas. Sin excusas."
          align="left"
          snippet={{
            title: "DNS Resolver desde Sockets",
            difficulty: "advanced",
            icon: "Ω",
            slug: "dns-resolver"
          }}
        />
      </ScrollReveal>
      <ScrollReveal>
        <ValueBand
          index="02"
          kicker="Enfoque Profundo"
          heading="Concentración"
          accent="total."
          description="El setup no es tu problema. Tu problema es resolver el reto. Entorno listo en segundos para que tu mente no pierda el ritmo del código."
          align="right"
          snippet={{
            title: "Build your own Redis",
            difficulty: "intermediate",
            icon: "ρ",
            slug: "redis-clone"
          }}
        />
      </ScrollReveal>
      <ScrollReveal>
        <ValueBand
          index="03"
          kicker="Ingeniería Pura"
          heading="Sin"
          accent="atajos."
          description="La IA es tu copiloto en la oficina, pero aquí eres el único responsable. Sin videos. Sin tutoriales masticados. Solo tú y el rigor de la especificación técnica."
          align="left"
          snippet={{
            title: "Docker Container from Scratch",
            difficulty: "advanced",
            icon: "δ",
            slug: "docker-scratch"
          }}
        />
      </ScrollReveal>
    </section>
  );
}
