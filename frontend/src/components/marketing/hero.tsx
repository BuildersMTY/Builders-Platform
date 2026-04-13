import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Construye software real.{" "}
          <span className="text-primary">Aprende de verdad.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted md:text-xl">
          Proyectos reales que van directo a tu GitHub y tu portafolio.
          Certificaciones listas para LinkedIn. Sin tutoriales — solo código.
        </p>
        <div className="mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary-hover transition-colors duration-150"
          >
            Empieza a construir
          </Link>
        </div>
      </div>
    </section>
  );
}
