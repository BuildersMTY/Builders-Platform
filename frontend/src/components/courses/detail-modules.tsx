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
      <div className="flex items-baseline justify-between gap-6">
        <h2
          id="scope-heading"
          className="font-serif text-2xl italic leading-none text-text"
        >
          Alcance
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
          {String(modules.length).padStart(2, "0")} modulos /{" "}
          {String(totalSubmodules).padStart(2, "0")} submodulos
        </span>
      </div>

      <ol className="mt-6 border-t border-border">
        {modules.map((mod, modIdx) => {
          const moduleNo = String(modIdx + 1).padStart(2, "0");
          return (
            <li
              key={mod.id}
              className="group border-b border-border py-6"
            >
              <div className="flex items-baseline gap-6">
                <span className="shrink-0 font-serif text-3xl italic leading-none text-text-dim transition-colors duration-200 group-hover:text-text">
                  {moduleNo}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-base font-medium tracking-tight text-text">
                      {mod.title}
                    </h3>
                    <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim sm:inline">
                      {mod.id}
                    </span>
                  </div>
                  {mod.description && (
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-text-muted">
                      {mod.description}
                    </p>
                  )}
                  {mod.submodules.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-1.5">
                      {mod.submodules.map((sub, subIdx) => {
                        const subNo = `${moduleNo}.${String(subIdx + 1).padStart(2, "0")}`;
                        return (
                          <li
                            key={sub.id}
                            className="flex items-baseline gap-4 font-mono text-[12.5px] leading-relaxed"
                          >
                            <span className="shrink-0 tabular-nums text-text-dim">
                              {subNo}
                            </span>
                            <span className="text-text-muted">
                              {sub.title}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
