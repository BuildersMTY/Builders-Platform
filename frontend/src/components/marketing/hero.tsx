import Link from "next/link";
import { TerminalAnimation } from "./terminal-animation";

export function Hero() {
  return (
    <section className="relative flex min-h-[85dvh] items-center px-6 pt-24 pb-16">
      {/* Ambient red glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(255, 0, 0, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
        {/* Copy */}
        <div>
          <h1
            className="hero-animate font-semibold tracking-tight"
            style={{ animationDelay: "0.1s", fontSize: "clamp(2.75rem, 1.5rem + 4.5vw, 5.5rem)", lineHeight: 1.05 }}
          >
            <span className="block">
              Construye software{" "}
              <span className="font-serif italic text-primary">real</span>.
            </span>
            <span className="mt-2 block">
              Aprende de{" "}
              <span className="font-serif italic text-primary">verdad</span>.
            </span>
          </h1>

          {/* Architectural red bar — not a subtle line, a statement */}
          <div
            className="hero-animate mt-10 flex items-center gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="h-[3px] w-16 bg-primary" />
            <div className="h-[3px] w-4 bg-primary/40" />
          </div>

          <p
            className="hero-animate mt-8 max-w-md text-base text-text-muted"
            style={{ animationDelay: "0.4s", lineHeight: 1.7 }}
          >
            Sin instalar nada. Abre el editor, escribe código y ejecuta pruebas
            — todo en tu navegador. Tu proyecto terminado va directo a tu GitHub.
          </p>
          <p
            className="hero-animate mt-4 max-w-md text-base text-text-muted"
            style={{ animationDelay: "0.45s", lineHeight: 1.7 }}
          >
            HTTP servers, DNS resolvers, clientes Git. Los mismos retos que resuelven
            ingenieros en producción. No es un bootcamp — es práctica de ingeniería real.
          </p>

          <div
            className="hero-animate mt-12 flex items-center gap-6"
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
