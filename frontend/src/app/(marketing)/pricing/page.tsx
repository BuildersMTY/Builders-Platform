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
    description: "Un proyecto completo para que veas cómo funciona.",
    features: ["1 proyecto completo", "Editor en el navegador", "Pruebas automatizadas", "Sin instalar nada"],
    cta: "Empezar gratis",
    ctaHref: "/courses",
  },
  {
    name: "Buildmancer",
    price: "$199",
    period: "MXN/mes",
    description: "Todos los proyectos. Todos los lenguajes. Tu portafolio completo.",
    features: ["Proyectos ilimitados", "Go, Python y más", "Exportación a GitHub", "Certificación LinkedIn", "Niveles junior a senior"],
    cta: "Suscribirse",
    ctaHref: "/courses",
    highlighted: true,
  },
  {
    name: "Estudiante",
    price: "$149",
    period: "MXN/mes",
    description: "Todo en Buildmancer. Verifica tu correo .edu y listo.",
    features: ["Todo en Buildmancer", "Verificación con correo .edu", "Descuento permanente"],
    cta: "Verificar estudiante",
    ctaHref: "/courses",
  },
];

export default function PricingPage() {
  return (
    <div className="pt-24">
      <div className="px-6 text-center">
        <h1 className="text-4xl font-bold md:text-5xl tracking-tight">
          Un plan. <span className="font-serif italic text-primary">Todo</span> incluido.
        </h1>
        <p className="mt-5 text-lg text-text-muted">Sin límites artificiales. Construye todo lo que quieras.</p>
      </div>

      <div className="mx-auto mt-20 grid max-w-5xl gap-6 px-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col rounded-xl border p-10 transition-colors duration-200 ${
              tier.highlighted
                ? "border-primary/40 bg-primary-subtle ring-1 ring-primary/10"
                : "border-border bg-surface"
            }`}
          >
            {tier.highlighted && (
              <span className="mb-5 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white tracking-wide uppercase">Popular</span>
            )}
            <h3 className="text-xl font-semibold">{tier.name}</h3>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
              {tier.period && <span className="text-sm text-text-muted">{tier.period}</span>}
            </div>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">{tier.description}</p>
            <ul className="mt-8 flex-1 space-y-4">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check size={16} className="mt-0.5 flex-shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={tier.ctaHref}
              className={`mt-10 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200 ${
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
