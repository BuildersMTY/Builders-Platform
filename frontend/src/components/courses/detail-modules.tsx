import type { Module } from "@/lib/types";

interface DetailModulesProps {
  modules: Module[];
}

// Editorial module index — numbered table of contents, not a card grid.
// Monospace module IDs, serif emphasis on count, zero accent stripes.
export function DetailModules({ modules }: DetailModulesProps) {
  const totalSubmodules = modules.reduce(
    (acc, m) => acc + m.submodules.length,
    0
  );

  return (
    <section aria-labelledby="scope-heading">
      <div className="flex items-center justify-between gap-6 mb-12 px-2">
        <div className="flex items-center gap-4">
          <div className="h-[2px] w-12 bg-primary" />
          <h2
            id="scope-heading"
            className="font-serif text-3xl font-black italic text-text uppercase tracking-tighter"
          >
            Alcance Técnico
          </h2>
        </div>
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em] flex flex-col items-end text-text-dim">
          <span>{modules.length} Módulos</span>
          <span>{totalSubmodules} Unidades</span>
        </div>
      </div>

      <ol className="relative space-y-12 before:absolute before:left-6 before:top-2 before:h-full before:w-[2px] before:bg-border">
        {modules.map((mod, modIdx) => {
          const moduleNo = String(modIdx + 1).padStart(2, "0");
          return (
            <li
              key={mod.id}
              className="group relative pl-16 pt-1"
            >
              {/* Module Indicator — Sharp Square */}
              <div className="absolute left-6 top-3 h-4 w-4 -translate-x-1/2 rounded-none bg-surface border-2 border-primary group-hover:bg-primary transition-colors duration-300 z-10" />
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4 mb-2">
                   <span className="font-mono text-[11px] font-black uppercase tracking-widest text-primary">
                    Módulo {moduleNo}
                  </span>
                  <div className="h-[1px] flex-1 bg-border" />
                </div>
                
                <h3 className="text-2xl font-black tracking-tighter text-text group-hover:text-primary transition-colors duration-300 uppercase">
                  {mod.title}
                </h3>
                
                {mod.description && (
                  <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-text-muted/90 font-bold border-l-2 border-border pl-5">
                    {mod.description}
                  </p>
                )}
                
                {mod.submodules.length > 0 && (
                  <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {mod.submodules.map((sub, subIdx) => {
                      const subNo = `${moduleNo}.${String(subIdx + 1).padStart(2, "0")}`;
                      return (
                         <li
                          key={sub.id}
                          className="flex items-center gap-4 border-2 border-border bg-surface p-4 transition-all duration-300 hover:border-primary hover:bg-surface rounded-none group/item"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-bg font-mono text-[10px] font-black text-text-dim border border-border group-hover/item:border-primary/40">
                            {subNo}
                          </span>
                          <span className="text-[12px] font-black text-text-muted transition-colors uppercase tracking-tight">
                            {sub.title}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
