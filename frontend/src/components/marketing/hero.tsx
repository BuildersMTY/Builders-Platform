import Link from "next/link";
import { TerminalAnimation } from "./terminal-animation";

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center px-6 pt-24 pb-16">
      {/* Ambient red glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(255, 0, 0, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        {/* Copy */}
        <div>
          <h1
            className="hero-animate text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="block">
              Construye software{" "}
              <span className="font-serif italic text-primary">real</span>.
            </span>
            <span className="block">
              Aprende de{" "}
              <span className="font-serif italic text-primary">verdad</span>.
            </span>
          </h1>

          <div
            className="hero-animate mt-8 h-px w-12 bg-primary"
            style={{ animationDelay: "0.3s" }}
          />

          <p
            className="hero-animate mt-8 max-w-md text-base leading-relaxed text-text-muted"
            style={{ animationDelay: "0.4s" }}
          >
            Proyectos reales que van directo a tu GitHub y tu portafolio.
            Certificaciones listas para LinkedIn. Sin tutoriales — solo código.
          </p>

          <div
            className="hero-animate mt-10 flex items-center gap-6"
            style={{ animationDelay: "0.6s" }}
          >
            <Link
              href="/courses"
              className="inline-flex items-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Empieza a construir
            </Link>
            <a
              href="#como-funciona"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              Cómo funciona
            </a>
          </div>
        </div>

        {/* Terminal */}
        <div
          className="hero-animate mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
          style={{ animationDelay: "0.5s" }}
        >
          <TerminalAnimation />
        </div>
      </div>
    </section>
  );
}
