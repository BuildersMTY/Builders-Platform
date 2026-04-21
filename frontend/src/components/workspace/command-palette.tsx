"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  File,
  Package,
  Play,
  Home,
  FolderOpen,
  BookOpen,
} from "lucide-react";
import { useWorkspace, makeResourceTabId, getResourceStage, isResourceVisible } from "./workspace-provider";

interface Command {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    course,
    files,
    openFile,
    setActiveSubmodule,
    togglePanel,
    setTestOutputOpen,
    openResourceTab,
    activeSubmodule,
    getRunHistory,
  } = useWorkspace();

  // Listen for Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build commands
  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [];

    // File commands
    for (const f of files) {
      const filename = f.filepath.split("/").pop() ?? f.filepath;
      cmds.push({
        id: `file:${f.filepath}`,
        label: filename,
        category: "Archivos",
        icon: <File size={14} />,
        action: () => openFile(f.filepath),
        keywords: f.filepath,
      });
    }

    // Submodule commands
    if (course) {
      for (const mod of course.modules) {
        for (const sub of mod.submodules) {
          cmds.push({
            id: `sub:${sub.full_id}`,
            label: sub.title,
            category: "Submódulos",
            icon: <Package size={14} />,
            action: () => setActiveSubmodule(mod, sub),
            keywords: `${mod.title} ${sub.title}`,
          });
        }
      }
    }

    // Resource commands
    if (activeSubmodule) {
      const history = getRunHistory(activeSubmodule.full_id);
      for (const res of activeSubmodule.resources) {
        const stage = getResourceStage(res.type);
        if (isResourceVisible(stage, history)) {
          cmds.push({
            id: `res:${res.file}`,
            label: res.title,
            category: "Recursos",
            icon: <BookOpen size={14} />,
            action: () => openResourceTab(res.file, res.title),
          });
        }
      }
    }

    // Action commands
    cmds.push(
      {
        id: "action:run",
        label: "Ejecutar pruebas",
        category: "Acciones",
        icon: <Play size={14} />,
        action: () =>
          window.dispatchEvent(new CustomEvent("buildmancer:run-tests")),
        keywords: "run test ejecutar",
      },
      {
        id: "action:modules",
        label: "Abrir módulos",
        category: "Acciones",
        icon: <Package size={14} />,
        action: () => togglePanel("modules"),
      },
      {
        id: "action:files",
        label: "Abrir archivos",
        category: "Acciones",
        icon: <FolderOpen size={14} />,
        action: () => togglePanel("files"),
      },
      {
        id: "action:home",
        label: "Ir al inicio",
        category: "Acciones",
        icon: <Home size={14} />,
        action: () => router.push("/courses"),
        keywords: "home inicio salir",
      }
    );

    return cmds;
  }, [files, course, activeSubmodule, openFile, setActiveSubmodule, togglePanel, openResourceTab, router, getRunHistory]);

  // Filter
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.keywords?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Clamp selection
  useEffect(() => {
    if (selected >= filtered.length) setSelected(Math.max(0, filtered.length - 1));
  }, [filtered.length, selected]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      e.preventDefault();
      filtered[selected].action();
      setOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  if (!open) return null;

  // Group by category
  const groups: { category: string; items: (Command & { globalIdx: number })[] }[] = [];
  let globalIdx = 0;
  for (const cmd of filtered) {
    let group = groups.find((g) => g.category === cmd.category);
    if (!group) {
      group = { category: cmd.category, items: [] };
      groups.push(group);
    }
    group.items.push({ ...cmd, globalIdx });
    globalIdx++;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-bg/70"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md overflow-hidden border border-border bg-surface animate-overlayIn"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
          }
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-3 h-10">
          <Search size={13} strokeWidth={1.75} className="text-text-dim flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="files, submodules, actions..."
            className="flex-1 bg-transparent font-mono text-[13px] text-text placeholder:text-text-dim outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={filtered[selected] ? `cmd-${filtered[selected].id}` : undefined}
            aria-autocomplete="list"
          />
          <kbd className="border border-border px-1.5 py-px font-mono text-[10px] text-text-dim">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div id="command-results" role="listbox" className="max-h-[320px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center font-mono text-[11px] text-text-dim">
              no results
            </p>
          )}
          {groups.map((group) => (
            <div key={group.category}>
              <div className="px-3 pt-2 pb-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
                {group.category.toLowerCase()}
              </div>
              {group.items.map((cmd) => (
                <button
                  key={cmd.id}
                  id={`cmd-${cmd.id}`}
                  role="option"
                  aria-selected={cmd.globalIdx === selected}
                  onClick={() => {
                    cmd.action();
                    setOpen(false);
                  }}
                  onMouseEnter={() => setSelected(cmd.globalIdx)}
                  className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left font-mono text-[12px] transition-colors ${
                    cmd.globalIdx === selected
                      ? "bg-bg text-text"
                      : "text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  <span className="flex-shrink-0 text-text-dim">{cmd.icon}</span>
                  <span className="truncate">{cmd.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
