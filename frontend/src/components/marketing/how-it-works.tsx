function Step({
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
    <div className="group grid gap-6 md:grid-cols-[120px_1fr] md:gap-10">
      {/* Large step number — architectural, not decorative */}
      <div className="flex items-baseline gap-3 md:justify-end">
        <span className="font-serif text-6xl font-light italic leading-none tracking-tight text-primary md:text-7xl">
          {number}
        </span>
      </div>

      {/* Content */}
      <div className="border-t border-border pt-6">
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 max-w-lg text-sm text-text-muted" style={{ lineHeight: 1.7 }}>
          {description}
        </p>
        <p className="mt-4 font-mono text-xs text-text-dim">{detail}</p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-widest text-text-dim">
          Cómo funciona
        </p>

        <div className="mt-14 space-y-16">
          <Step
            number="01"
            title="Elige un proyecto y un nivel"
            description="HTTP servers, DNS, Git — los mismos desafíos que los ingenieros resuelven en la industria. Cada proyecto escala en dificultad: desde la implementación básica hasta optimización y edge cases. Juniors construyen cimientos. Seniors enfrentan concurrencia y performance."
            detail="http-server · dns-resolver · git-clone"
          />
          <Step
            number="02"
            title="Abre el editor y construye"
            description="Sin instalar nada. El entorno completo vive en tu navegador: editor con autocompletado, terminal integrada y pruebas automatizadas. Cada submódulo te da una especificación clara y valida tu código en tiempo real. Tú decides cómo resolverlo."
            detail="func handleConnection(conn net.Conn) { ... }"
          />
          <Step
            number="03"
            title="Demuestra lo que construiste"
            description="Tu proyecto terminado aparece en tu GitHub — con tu historial de commits real, no un fork ni un template. Agrega la certificación verificable a LinkedIn. Los reclutadores ven código, no credenciales genéricas."
            detail="github.com/tu-usuario/http-server"
          />
        </div>
      </div>
    </section>
  );
}
