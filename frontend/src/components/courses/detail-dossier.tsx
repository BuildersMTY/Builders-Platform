import type { CourseMeta } from "@/lib/types";

interface DetailDossierProps {
  meta: CourseMeta;
  languages: string[];
  moduleCount: number;
  submoduleCount: number;
}

// Technical dossier rail — small-caps monospace, zero decoration.
// Reads like a spec sheet on the back of a dev tool box.
export function DetailDossier({
  meta,
  languages,
  moduleCount,
  submoduleCount,
}: DetailDossierProps) {
  const rows: Array<[string, React.ReactNode]> = [
    ["Stack", meta.language],
    ["Disponible", languages.join(" / ")],
    ["Nivel", meta.difficulty],
    ["Runner", meta.runner],
    [
      "Alcance",
      <>
        {moduleCount} <span className="text-text-dim">modulos</span>
        <span className="mx-1.5 text-text-dim">/</span>
        {submoduleCount} <span className="text-text-dim">submodulos</span>
      </>,
    ],
    [
      "Estimado",
      <>
        <span>{meta.estimated_hours.junior}</span>
        <span className="text-text-dim"> jr </span>
        <span className="mx-0.5 text-text-dim">&middot;</span>
        <span>{meta.estimated_hours.mid}</span>
        <span className="text-text-dim"> mid </span>
        <span className="mx-0.5 text-text-dim">&middot;</span>
        <span>{meta.estimated_hours.senior}</span>
        <span className="text-text-dim"> sr</span>
        <span className="ml-1.5 text-text-dim">hrs</span>
      </>,
    ],
  ];

  return (
    <aside className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
          Dossier
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
          /{meta.slug}
        </span>
      </div>
      <dl className="flex flex-col divide-y divide-border/60 border-t border-border/60">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-6 py-3"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
              {label}
            </dt>
            <dd className="text-right font-mono text-[13px] text-text tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {(meta.build_cmd || meta.unit_cmd || meta.run_cmd) && (
        <div className="mt-7">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
            Comandos
          </span>
          <div className="mt-3 space-y-1.5 border border-border bg-surface px-4 py-3 font-mono text-[12px] leading-relaxed text-text-muted">
            {meta.build_cmd && (
              <div>
                <span className="text-text-dim">$ </span>
                {meta.build_cmd}
              </div>
            )}
            {meta.unit_cmd && (
              <div>
                <span className="text-text-dim">$ </span>
                {meta.unit_cmd}
              </div>
            )}
            {meta.run_cmd && (
              <div>
                <span className="text-text-dim">$ </span>
                {meta.run_cmd}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
