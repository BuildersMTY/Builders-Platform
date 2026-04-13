function TimelineStep({
  number,
  title,
  description,
  detail,
}: {
  number: string;
  title: string;
  description: string;
  detail: string;
}) {
  return (
    <div className="relative pl-12">
      {/* Dot on the line */}
      <div className="absolute left-0 top-1 flex h-[31px] w-[31px] items-center justify-center rounded-full border border-primary/30 bg-bg">
        <div className="h-2 w-2 rounded-full bg-primary" />
      </div>

      <span className="text-xs font-medium uppercase tracking-widest text-primary/60">
        {number}
      </span>
      <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
        {description}
      </p>
      <p className="mt-3 font-mono text-xs text-text-dim">{detail}</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-32">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-text-dim">
          Cómo funciona
        </p>

        <div className="relative mt-16">
          {/* Vertical connector */}
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

          <div className="space-y-16">
            <TimelineStep
              number="01"
              title="Elige un proyecto"
              description="HTTP servers, DNS, Git — los mismos desafíos que los ingenieros resuelven en la industria."
              detail="http-server · dns-resolver · git-clone"
            />
            <TimelineStep
              number="02"
              title="Escribe código real"
              description="Submódulos guiados con pruebas automatizadas. Sin hand-holding — tú escribes cada línea."
              detail="func handleConnection(conn net.Conn) { ... }"
            />
            <TimelineStep
              number="03"
              title="Llévalo a tu portafolio"
              description="Tu proyecto en tu GitHub, con tu historial de commits. Certificación lista para LinkedIn."
              detail="github.com/tu-usuario/http-server"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
