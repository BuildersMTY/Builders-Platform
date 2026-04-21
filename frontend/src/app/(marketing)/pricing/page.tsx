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
          {/* Tiny meta strip — like a magazine index line */}
          <div className="flex items-center gap-4 text-text-dim">
            <span
              aria-hidden
              className="h-px w-10 bg-border"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
              N&deg; 01 &middot; Precios
            </span>
            <span
              aria-hidden
              className="block h-1 w-1 rounded-full bg-primary"
              title="Plan activo"
            />
          </div>

          {/* Asymmetric headline — serif, large, breaks across columns */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
            <h1 className="md:col-span-9 font-serif text-[52px] leading-[0.96] tracking-[-0.02em] text-text md:text-[112px]">
              Un precio.
              <br />
              Un portafolio
              <br />
              <span className="italic">real.</span>
            </h1>

            <aside className="md:col-span-3 md:pt-6 md:border-l md:border-border md:pl-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim">
                Editorial
              </p>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                Los precios son provisionales. Se ajustaran una sola vez antes
                del lanzamiento publico y quedaran fijos durante 12 meses para
                quien se suscriba hoy.
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim">
                Abril 2026 &mdash; v0.1
              </p>
            </aside>
          </div>

          {/* Ultra-confident subhead, no hedging */}
          <p className="mt-14 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
            No cobramos por hora de video. No cobramos por modulo. Pagas una
            sola cosa: acceso irrestricto a construir en un entorno profesional
            hasta que el codigo sea tuyo.
          </p>

          {/* Quick anchor to the tiers, no gradient CTA here — stay editorial */}
          <div className="mt-12 flex items-center gap-6">
            <Link
              href="#planes"
              className="inline-flex items-center gap-3 text-sm font-medium text-text transition-colors hover:text-text-muted"
            >
              <span
                aria-hidden
                className="h-px w-8 bg-text transition-[width] duration-300 group-hover:w-12"
              />
              Ver los tres caminos
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim">
              3 planes &middot; 0 contratos
            </span>
          </div>
        </div>
      </header>

      <div id="planes" className="scroll-mt-24">
        <PricingTiers />
      </div>

      <PricingNotIncluded />

      {/* Founder's note — replaces the "contact sales for enterprise" cliche */}
      <section className="px-6 py-28">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-12">
          <p className="md:col-span-3 font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">
            Nota del fundador
          </p>
          <div className="md:col-span-9">
            <p className="font-serif text-2xl leading-[1.35] text-text md:text-[28px]">
              &ldquo;Prefiero cobrar poco y construir algo que no de
              verguenza, que cobrar mucho y venderte otro curso mas. Si un
              dia el precio ya no refleja el producto, se avisa con un mes
              de anticipacion. Ese es el trato.&rdquo;
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-text-dim">
              Raul &mdash; Fundador, BuildersPlatform
            </p>
          </div>
        </div>
      </section>

      <Faq />
    </div>
  );
}
