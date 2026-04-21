import { CourseSnippetCard } from "@/components/courses/course-snippet-card";

export function Manifesto() {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:py-48">
      <div className="mx-auto grid max-w-[1200px] grid-cols-12 gap-x-12 items-center">
        {/* Pull quote — col 1-8 */}
        <blockquote
          className="col-span-12 md:col-span-8"
          style={{ letterSpacing: "-0.015em" }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary mb-6">
            § El Manifiesto
          </p>
          <p
            className="font-serif italic text-text"
            style={{
              fontSize: "clamp(1.75rem, 0.9rem + 2.8vw, 3.5rem)",
              lineHeight: 1.15,
            }}
          >
            En la era de la IA, el código es barato, pero el razonamiento es{" "}
            <span className="not-italic font-sans font-semibold text-text border-b-2 border-primary/20">
              oro
            </span>
            . Aquí vienes a fortalecer el criterio que te hace un ingeniero, no
            un operador de prompts.
          </p>

          <footer className="mt-10 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-text-dim">
            <span className="h-px w-10 bg-border" />
            <span>Builders Platform · 2026</span>
          </footer>
        </blockquote>

        {/* Asymmetric Snippet — col 9-12 */}
        <div className="hidden md:flex col-span-4 justify-end">
          <CourseSnippetCard 
            title="HTTP Server de Alto Rendimiento"
            difficulty="intermediate"
            icon="λ"
            slug="http-server-extreme"
          />
        </div>
      </div>
    </section>
  );
}
