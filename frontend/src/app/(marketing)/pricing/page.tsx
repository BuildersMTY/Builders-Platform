import Link from "next/link";
import { Faq } from "@/components/marketing/faq";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { PricingNotIncluded } from "@/components/marketing/pricing-not-included";

export default function PricingPage() {
  return (
    <div>
      {/* Editorial masthead */}
      <header className="px-6 pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="mx-auto max-w-6xl">

          {/* Asymmetric headline — serif, large, breaks across columns */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
            <h1 className="md:col-span-9 font-serif text-[52px] leading-[0.96] tracking-[-0.02em] text-text md:text-[112px]">
              Un precio.
              <br />
              Un portafolio
              <br />
              <span className="italic">real.</span>
            </h1>

            <aside className="md:col-span-3 md:pt-6 md:border-l md:border-border md:pl-6">
              <p className="text-[13px] font-semibold text-text">
                Modelo de Acceso
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                Los precios son provisionales. Se ajustarán una sola vez antes
                del lanzamiento público y quedarán fijos durante 12 meses para
                quien se suscriba hoy.
              </p>
              <p className="mt-4 text-[12px] font-medium text-text-dim">
                v0.1 — Acceso Anticipado
              </p>
            </aside>
          </div>

          {/* Ultra-confident subhead, no hedging */}
          <p className="mt-14 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
             No vendemos videos por módulo. Pagas una
            sola cosa: acceso irrestricto a construir en un entorno profesional
            hasta que el código sea tuyo.
          </p>
 
          {/* Primary CTA */}
          <div className="mt-12 flex items-center gap-6">
            <Link
              href="#planes"
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-sm border border-primary bg-primary/10 px-8 text-[13px] font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-bg"
            >
              <span>Ver los planes</span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-1">↓</span>
            </Link>
            <div className="flex items-center gap-2 text-[12px] font-medium text-text-dim">
              <span className="h-1.5 w-1.5 bg-primary" />
              <span>Sin contratos</span>
            </div>
          </div>
        </div>
      </header>

      <div id="planes" className="scroll-mt-24">
        <PricingTiers />
      </div>

      <PricingNotIncluded />

      {/* Founder's note */}
      <section className="px-6 py-28 border-t border-border bg-surface/30">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 md:grid-cols-12 items-baseline">
          <p className="md:col-span-3 font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">
            Nota del fundador
          </p>
          <div className="md:col-span-9">
            <p className="font-serif italic text-2xl leading-[1.3] text-text md:text-[32px]">
              &ldquo;En BuildMancer priorizamos el impacto real en la carrera de estudiantes y devs sobre el beneficio rápido. Mi compromiso es ofrecerte una plataforma de alto nivel sin los precios inflados de la industria, simplemente porque es el producto que a mí me hubiera gustado tener cuando empecé. Si las condiciones cambian, te lo diré un mes antes. Sin trucos.&rdquo;
            </p>
            <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-text-dim">
              &mdash; Raúl, Fundador de BuildMancer.
            </p>
          </div>
        </div>
      </section>

      <Faq />
    </div>
  );
}
