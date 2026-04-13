import { Check } from "lucide-react";
import Link from "next/link";
import { Faq } from "@/components/marketing/faq";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Prueba un proyecto completo sin costo.",
    features: ["1 proyecto gratuito", "Editor completo", "Pruebas automatizadas", "Entorno de desarrollo completo"],
    cta: "Comenzar gratis",
    ctaHref: "/courses",
  },
  {
    name: "Buildmancer",
    price: "$199",
    period: "MXN/mes",
    description: "Todo lo que necesitas para construir tu carrera.",
    features: ["Todos los proyectos", "Todos los lenguajes", "Exportación a GitHub", "Certificación LinkedIn", "Seguimiento de progreso"],
    cta: "Suscribirse",
    ctaHref: "/courses",
    highlighted: true,
  },
  {
    name: "Estudiante",
    price: "$149",
    period: "MXN/mes",
    description: "Todo en Buildmancer, con descuento estudiantil.",
    features: ["Todo en Buildmancer", "Verificación con correo .edu", "Descuento estudiantil permanente"],
    cta: "Verificar estudiante",
    ctaHref: "/courses",
  },
];

export default function PricingPage() {
  return (
    <div className="pt-24">
      <div className="px-6 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">Un plan. Todo incluido.</h1>
        <p className="mt-4 text-lg text-text-muted">Sin límites artificiales. Construye todo lo que quieras.</p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 px-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col rounded-xl border p-8 ${
              tier.highlighted ? "border-primary bg-primary-subtle" : "border-border bg-surface"
            }`}
          >
            {tier.highlighted && (
              <span className="mb-4 inline-flex w-fit rounded-md bg-primary px-2.5 py-0.5 text-xs font-medium text-white">Popular</span>
            )}
            <h3 className="text-xl font-semibold">{tier.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{tier.price}</span>
              {tier.period && <span className="text-sm text-text-muted">{tier.period}</span>}
            </div>
            <p className="mt-2 text-sm text-text-muted">{tier.description}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="mt-0.5 flex-shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={tier.ctaHref}
              className={`mt-8 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                tier.highlighted
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "border border-white/20 text-white hover:bg-surface-hover"
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <Faq />
    </div>
  );
}
