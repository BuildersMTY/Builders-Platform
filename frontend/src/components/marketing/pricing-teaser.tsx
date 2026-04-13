import Link from "next/link";

export function PricingTeaser() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Comienza gratis</h2>
        <p className="mt-4 text-lg text-text-muted">
          Un proyecto completo sin costo. Planes desde{" "}
          <span className="text-text font-semibold">$149 MXN/mes</span> para estudiantes.
        </p>
        <div className="mt-8">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-surface-hover transition-colors duration-150"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </section>
  );
}
