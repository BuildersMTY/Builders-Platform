import { ScrollReveal } from "./scroll-reveal";

function ValueBand({
  heading,
  accent,
  description,
  align,
}: {
  heading: string;
  accent: string;
  description: string;
  align: "left" | "right";
}) {
  return (
    <div className="border-t border-border px-6 py-16 md:py-24">
      <div
        className={`mx-auto max-w-6xl ${align === "right" ? "text-right" : ""}`}
      >
        <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-6xl">
          {heading}{" "}
          <span className="font-serif italic text-primary">{accent}</span>
        </h3>
        <p
          className={`mt-6 max-w-md text-base leading-relaxed text-text-muted ${
            align === "right" ? "ml-auto" : ""
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export function CareerValue() {
  return (
    <section className="py-16 md:py-32">
      <ScrollReveal>
        <ValueBand
          heading="Tu código."
          accent="Tu GitHub."
          description="Termina un proyecto y el repositorio aparece en tu perfil. Con tu historial de commits real — no un template clonado."
          align="left"
        />
      </ScrollReveal>
      <ScrollReveal>
        <ValueBand
          heading="Certificación"
          accent="verificable."
          description="Demuestra que construiste un servidor HTTP desde cero. No que viste un video de cuatro horas."
          align="right"
        />
      </ScrollReveal>
      <ScrollReveal>
        <ValueBand
          heading="Arquitectura"
          accent="real."
          description="Protocolos, concurrencia, parsing. Los mismos problemas que resuelven los ingenieros que construyeron el software que usas."
          align="left"
        />
      </ScrollReveal>
    </section>
  );
}
