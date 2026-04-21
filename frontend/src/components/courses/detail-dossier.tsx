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
    <aside className="border-2 border-text bg-surface p-8 rounded-none lg:sticky lg:top-8 shadow-[8px_8px_0px_rgba(var(--color-primary-rgb),0.1)]">
      <div className="mb-8 flex items-center justify-between border-b-2 border-border pb-6">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-primary">
            Dossier Técnico
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim">
            Ficha: {meta.slug}
          </span>
        </div>
        <div className="h-10 w-10 rounded-none border-2 border-text bg-bg flex items-center justify-center font-serif italic text-xl text-primary font-black">
          {meta.language.slice(0, 1).toUpperCase()}
        </div>
      </div>
      
      <dl className="flex flex-col gap-6">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-2 group"
          >
            <dt className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-text-dim flex items-center gap-2">
              <span className="h-2 w-2 bg-primary/60" />
              {label}
            </dt>
            <dd className="font-mono text-[14px] font-black text-text tabular-nums pl-4 border-l-2 border-border group-hover:border-primary transition-colors">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {(meta.build_cmd || meta.unit_cmd || meta.run_cmd) && (
        <div className="mt-10 pt-8 border-t-2 border-border">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-text flex items-center gap-2 mb-4">
             <span className="material-symbols-outlined text-[18px]">terminal</span>
             Protocolo
          </span>
          <div className="space-y-4 bg-bg p-6 font-mono text-[12px] leading-relaxed border-2 border-border rounded-none shadow-inner">
            {meta.build_cmd && (
              <div className="flex flex-col gap-1">
                <span className="text-primary font-black uppercase tracking-widest text-[9px]">// build</span>
                <code className="text-text font-bold break-all">{meta.build_cmd}</code>
              </div>
            )}
            {meta.unit_cmd && (
              <div className="flex flex-col gap-1">
                <span className="text-primary font-black uppercase tracking-widest text-[9px]">// test</span>
                <code className="text-text font-bold break-all">{meta.unit_cmd}</code>
              </div>
            )}
            {meta.run_cmd && (
              <div className="flex flex-col gap-1">
                <span className="text-primary font-black uppercase tracking-widest text-[9px]">// run</span>
                <code className="text-text font-bold break-all">{meta.run_cmd}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
