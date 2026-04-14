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
    <div className="border-t border-border px-6 py-14 md:py-24">
      <div
        className={`mx-auto max-w-6xl ${align === "right" ? "text-right" : ""}`}
      >
        <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-6xl">
          {heading}{" "}
          <span className="font-serif italic text-primary">{accent}</span>
        </h3>
        <p
          className={`mt-6 max-w-md text-base text-text-muted ${
            align === "right" ? "ml-auto" : ""
          }`}
          style={{ lineHeight: 1.7 }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export function CareerValue() {
  return (
    <section className="py-16 md:py-28">
      <ScrollReveal>
        <ValueBand
          heading="Tu código."
          accent="Tu GitHub."
          description="Cada proyecto terminado vive en tu perfil con tu historial de commits. No es un fork. No es un template. Un reclutador puede abrir tu repo y leer exactamente cómo resolviste cada problema."
          align="left"
        />
      </ScrollReveal>
      <ScrollReveal>
        <ValueBand
          heading="Zero"
          accent="configuración."
          description="Sin instalar Go. Sin configurar Docker. Sin perder una hora en tu entorno. Abre el navegador, elige un proyecto y escribe la primera línea de código en menos de un minuto."
          align="right"
        />
      </ScrollReveal>
      <ScrollReveal>
        <ValueBand
          heading="No es un"
          accent="bootcamp."
          description="No hay videos. No hay lectures. No hay hand-holding. Recibes una especificación, un editor y pruebas automatizadas. Tú decides cómo implementarlo — como en un equipo de ingeniería real."
          align="left"
        />
      </ScrollReveal>
    </section>
  );
}
