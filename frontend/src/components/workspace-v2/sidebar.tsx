"use client";

import React, { useState } from "react";
import { Icon, extColor } from "./icons";
import type { Course, Submodule, FileEntry, Resource } from "./types";

export interface SidebarShellProps {
  view: string | null;
  course: Course;
  activeSub: Submodule;
  setActiveSub: (sub: Submodule) => void;
  files: FileEntry[];
  openFile: (path: string) => void;
  activeFile: string | null;
  resources?: Resource[];
  openResource: (r: Resource) => void;
  runHistory: { total: number; failed: number };
  meta?: string;
}

export function SidebarShell(props: SidebarShellProps) {
  const { view, meta } = props;
  if (!view) return null;
  return (
    <div style={{
      width: 264,
      flexShrink: 0,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--text-muted)",
          fontWeight: 500,
        }}>
          {view}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
          {meta}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {view === "modules" && <ModuleList course={props.course} activeSub={props.activeSub} setActiveSub={props.setActiveSub} />}
        {view === "files" && <FileTree files={props.files} openFile={props.openFile} activeFile={props.activeFile} activeSub={props.activeSub} />}
        {view === "resources" && <ResourceList resources={props.resources} openResource={props.openResource} runHistory={props.runHistory} />}
      </div>
    </div>
  );
}

interface ModuleListProps {
  course: Course;
  activeSub: Submodule;
  setActiveSub: (sub: Submodule) => void;
}

function ModuleList({ course, setActiveSub }: ModuleListProps) {
  const initialId = course.modules.find(m => m.submodules.some(s => s.active))?.id;
  const [expanded, setExpanded] = useState<Set<string>>(new Set(initialId ? [initialId] : []));

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  return (
    <div style={{ padding: "8px 0 16px" }}>
      {/* Course header */}
      <div style={{ padding: "6px 14px 14px", borderBottom: "1px solid var(--border)" }}>
        <p style={{
          margin: 0,
          fontSize: 13,
          color: "var(--text)",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}>{course.title}</p>
        <p style={{
          margin: "3px 0 0",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-faint)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          lang · {course.lang_label}
        </p>
      </div>

      {course.modules.map((mod, mi) => {
        const done = mod.submodules.filter(s => s.passed).length;
        const total = mod.submodules.length;
        const allDone = done === total;
        const open = expanded.has(mod.id);
        return (
          <div key={mod.id} style={{ marginTop: mi === 0 ? 6 : 0 }}>
            <button
              onClick={() => toggle(mod.id)}
              className="hover-row"
              style={{
                display: "flex", width: "100%", alignItems: "center",
                gap: 8, padding: "7px 14px",
                background: "transparent", border: "none",
                color: "inherit", cursor: "pointer", textAlign: "left",
              }}
            >
              <Icon.Chevron size={10} strokeWidth={2}
                style={{
                  color: "var(--text-faint)",
                  transition: "transform 150ms",
                  transform: open ? "rotate(90deg)" : "none",
                  flexShrink: 0,
                }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{
                    fontSize: 12.5,
                    color: allDone ? "var(--success)" : "var(--text)",
                    fontWeight: 500,
                    letterSpacing: "-0.005em",
                  }}>{mod.title}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: allDone ? "var(--success)" : "var(--text-faint)",
                    fontVariantNumeric: "tabular-nums",
                  }}>{done}/{total}</span>
                </div>
                <div style={{ display: "flex", gap: 2, marginTop: 5 }}>
                  {mod.submodules.map(sub => (
                    <div key={sub.full_id} style={{
                      flex: 1,
                      height: 2,
                      background: sub.passed
                        ? "var(--success)"
                        : sub.active
                          ? "var(--primary)"
                          : "var(--border-strong)",
                      boxShadow: sub.active ? "0 0 6px var(--primary-glow)" : "none",
                      transition: "background 300ms",
                    }} />
                  ))}
                </div>
              </div>
            </button>

            {open && (
              <div style={{ paddingBottom: 4 }}>
                {mod.submodules.map((sub, si) => {
                  const prev = si > 0 ? mod.submodules[si - 1] : null;
                  const locked = !sub.passed && !sub.active && !!prev && !prev.passed;
                  const isActive = !!sub.active;

                  return (
                    <button
                      key={sub.full_id}
                      onClick={() => !locked && setActiveSub(sub)}
                      disabled={locked}
                      className={!locked ? "hover-row" : ""}
                      style={{
                        display: "flex", width: "100%",
                        alignItems: "center", gap: 8,
                        padding: "5px 14px 5px 34px",
                        background: isActive ? "linear-gradient(90deg, var(--primary-dim) 0%, transparent 80%)" : "transparent",
                        borderLeft: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                        paddingLeft: isActive ? 32 : 34,
                        border: "none",
                        borderLeftWidth: 2,
                        borderLeftStyle: "solid",
                        borderLeftColor: isActive ? "var(--primary)" : "transparent",
                        color: "inherit",
                        cursor: locked ? "not-allowed" : "pointer",
                        textAlign: "left",
                        opacity: locked ? 0.4 : 1,
                        position: "relative",
                      }}
                    >
                      {sub.passed ? (
                        <Icon.CheckCircle size={12} style={{ color: "var(--success)", flexShrink: 0 }} strokeWidth={1.75} />
                      ) : isActive ? (
                        <span style={{
                          position: "relative", width: 12, height: 12, flexShrink: 0,
                          display: "grid", placeItems: "center",
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: "var(--primary)",
                            boxShadow: "0 0 0 3px var(--primary-dim), 0 0 8px var(--primary-glow)",
                          }} />
                        </span>
                      ) : locked ? (
                        <Icon.Lock size={10} style={{ color: "var(--text-faint)", flexShrink: 0 }} strokeWidth={1.75} />
                      ) : (
                        <Icon.Circle size={12} style={{ color: "var(--text-faint)", flexShrink: 0 }} strokeWidth={1.5} />
                      )}
                      <span style={{
                        fontSize: 12,
                        color: isActive ? "var(--text)" : sub.passed ? "var(--text-muted)" : "var(--text-dim)",
                        fontWeight: isActive ? 500 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.005em",
                      }}>{sub.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .hover-row:hover { background: var(--surface-hover) !important; }
      `}</style>
    </div>
  );
}

interface FileTreeProps {
  files: FileEntry[];
  openFile: (path: string) => void;
  activeFile: string | null;
  activeSub: Submodule;
}

interface TreeNode {
  __file?: FileEntry;
  [key: string]: TreeNode | FileEntry | undefined;
}

function FileTree({ files, openFile, activeFile, activeSub }: FileTreeProps) {
  const stubPaths = new Set((activeSub?.stubs || []).map(s => s.path));
  // Build simple tree
  const tree: TreeNode = {};
  for (const f of files) {
    const parts = f.path.split("/");
    let node: TreeNode = tree;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        (node as Record<string, TreeNode>)[p] = { __file: f };
      } else {
        (node as Record<string, TreeNode>)[p] = ((node as Record<string, TreeNode>)[p] || {}) as TreeNode;
        node = (node as Record<string, TreeNode>)[p];
      }
    }
  }

  function Node({ name, node, depth }: { name: string; node: TreeNode; depth: number }) {
    const [open, setOpen] = useState(true);
    if (node.__file) {
      const f = node.__file;
      const isStub = stubPaths.has(f.path);
      const isActive = activeFile === f.path;
      return (
        <button
          onClick={() => openFile(f.path)}
          className="hover-row"
          style={{
            display: "flex", width: "100%", alignItems: "center",
            gap: 7,
            padding: `3px 14px 3px ${depth * 14 + 14}px`,
            background: isActive ? "var(--bg)" : "transparent",
            borderLeft: isActive ? "2px solid var(--primary)" : "2px solid transparent",
            paddingLeft: isActive ? depth * 14 + 12 : depth * 14 + 14,
            border: "none",
            borderLeftWidth: 2,
            borderLeftStyle: "solid",
            borderLeftColor: isActive ? "var(--primary)" : "transparent",
            color: "inherit", cursor: "pointer", textAlign: "left",
            fontFamily: "var(--font-mono)", fontSize: 11.5,
          }}
        >
          <span style={{
            width: 5, height: 5, flexShrink: 0,
            background: extColor(name),
            opacity: isStub || isActive ? 1 : 0.5,
          }} />
          <span style={{
            color: isActive ? "var(--text)" : isStub ? "var(--text-muted)" : "var(--text-dim)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}>{name}</span>
          {f.modified && (
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "var(--warning)",
              flexShrink: 0,
            }} title="Unsaved changes" />
          )}
          {isStub && !f.modified && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--primary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              flexShrink: 0,
              opacity: 0.7,
            }}>stub</span>
          )}
        </button>
      );
    }
    const entries = (Object.entries(node) as [string, TreeNode][]).sort((a, b) => {
      const aFile = !!a[1].__file, bFile = !!b[1].__file;
      if (aFile !== bFile) return aFile ? 1 : -1;
      return a[0].localeCompare(b[0]);
    });
    return (
      <div>
        {name && (
          <button
            onClick={() => setOpen(!open)}
            className="hover-row"
            style={{
              display: "flex", width: "100%", alignItems: "center",
              gap: 5,
              padding: `3px 14px 3px ${depth * 14 + 10}px`,
              background: "transparent", border: "none",
              color: "inherit", cursor: "pointer", textAlign: "left",
              fontFamily: "var(--font-mono)", fontSize: 11.5,
            }}
          >
            <Icon.Chevron size={9} strokeWidth={2}
              style={{
                color: "var(--text-faint)",
                transition: "transform 150ms",
                transform: open ? "rotate(90deg)" : "none",
              }} />
            <span style={{ color: "var(--text-muted)" }}>{name}</span>
          </button>
        )}
        {open && entries.map(([k, v]) => (
          <Node key={k} name={k} node={v} depth={depth + (name ? 1 : 0)} />
        ))}
      </div>
    );
  }

  const entries = (Object.entries(tree) as [string, TreeNode][]).sort((a, b) => {
    const aFile = !!a[1].__file, bFile = !!b[1].__file;
    if (aFile !== bFile) return aFile ? 1 : -1;
    return a[0].localeCompare(b[0]);
  });

  return (
    <div style={{ padding: "6px 0 16px" }}>
      {entries.map(([k, v]) => <Node key={k} name={k} node={v} depth={0} />)}
      <style>{`
        .hover-row:hover { background: var(--surface-hover) !important; }
      `}</style>
    </div>
  );
}

interface ResourceListProps {
  resources?: Resource[];
  openResource: (r: Resource) => void;
  runHistory: { total: number; failed: number };
}

function ResourceList({ resources, openResource, runHistory }: ResourceListProps) {
  if (!resources) return null;
  const isVisible = (r: Resource) => {
    if (r.stage === 0) return true;
    if (r.stage === 1) return runHistory.total >= 1;
    if (r.stage === 2) return runHistory.failed >= 1;
    return false;
  };
  const typeMeta: Record<Resource["type"], { label: string; icon: React.ReactElement; color: string }> = {
    doc: { label: "doc", icon: <Icon.Book size={11} />, color: "var(--text-muted)" },
    signature: { label: "signature", icon: <Icon.Signature size={11} />, color: "var(--info)" },
    hint: { label: "hint", icon: <Icon.Hint size={11} />, color: "var(--warning)" },
  };

  return (
    <div style={{ padding: "10px 0 16px" }}>
      <p style={{
        margin: "0 14px 10px",
        fontSize: 11.5,
        color: "var(--text-dim)",
        lineHeight: 1.5,
      }}>
        Resources unlock as you progress. Read, try, get unstuck.
      </p>
      {resources.map(r => {
        const vis = isVisible(r);
        const meta = typeMeta[r.type];
        return (
          <button
            key={r.id}
            onClick={() => vis && openResource(r)}
            disabled={!vis}
            className={vis ? "hover-row" : ""}
            style={{
              display: "flex", alignItems: "flex-start", gap: 9,
              width: "100%", padding: "9px 14px",
              background: "transparent", border: "none",
              color: "inherit", cursor: vis ? "pointer" : "not-allowed",
              textAlign: "left",
              borderBottom: "1px solid var(--border)",
              opacity: vis ? 1 : 0.45,
            }}
          >
            <span style={{
              marginTop: 2,
              color: meta.color,
              flexShrink: 0,
            }}>{vis ? meta.icon : <Icon.Lock size={10} />}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12,
                color: vis ? "var(--text)" : "var(--text-dim)",
                fontWeight: 500,
                lineHeight: 1.3,
              }}>{r.title}</div>
              <div style={{
                marginTop: 3,
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: vis ? meta.color : "var(--text-faint)",
                opacity: 0.85,
              }}>
                {vis ? meta.label : r.stage === 1 ? "after first run" : "after a failed run"}
              </div>
            </div>
          </button>
        );
      })}
      <style>{`
        .hover-row:hover { background: var(--surface-hover) !important; }
      `}</style>
    </div>
  );
}
