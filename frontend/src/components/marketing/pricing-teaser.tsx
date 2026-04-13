import Link from "next/link";

export function PricingTeaser() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* Bottom red ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(255, 0, 0, 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Deja de practicar{" "}
          <span className="font-serif italic text-primary">en el vacío</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base text-text-muted">
          Un proyecto completo sin costo. Planes desde{" "}
          <span className="font-medium text-text">$149 MXN/mes</span> para
          estudiantes.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <Link
            href="/courses"
            className="inline-flex items-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Empieza gratis
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </section>
  );
}
