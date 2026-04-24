"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "./icons";
import type { Submodule, Toast } from "./types";

export interface SuccessOverlayProps {
  sub: Submodule;
  onContinue: () => void;
  onDismiss: () => void;
}

export function SuccessOverlay({ sub, onContinue, onDismiss }: SuccessOverlayProps) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at center, rgba(10,8,8,0.92) 0%, rgba(10,8,8,0.98) 70%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 20,
      animation: "fade-in 250ms ease-out",
      backdropFilter: "blur(6px)",
    }}>
      <div style={{
        width: 460,
        padding: "42px 44px 32px",
        background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 100%)",
        border: "1px solid var(--border-strong)",
        borderTop: "1px solid rgba(111,214,184,0.4)",
        position: "relative",
        animation: "celebrate-in 400ms cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Glow from top */}
        <div style={{
          position: "absolute", top: -1, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent 0%, var(--success) 50%, transparent 100%)",
          boxShadow: "0 0 20px rgba(111,214,184,0.5)",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40, flexShrink: 0,
            display: "grid", placeItems: "center",
            background: "var(--success-dim)",
            border: "1px solid rgba(111,214,184,0.35)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12"
                stroke="var(--success)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="30" strokeDashoffset="30"
                style={{ animation: "check-draw 500ms cubic-bezier(0.65,0,0.35,1) 200ms forwards" }}
              />
            </svg>
          </div>
          <div>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "var(--success)",
            }}>submodule complete</p>
            <h2 style={{
              margin: "4px 0 0",
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 400,
              color: "var(--text)",
              letterSpacing: "-0.015em",
            }}>{sub.title}</h2>
          </div>
        </div>

        <p style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--text-muted)",
          maxWidth: 400,
        }}>
          You just wrote a full HTTP/1.1 response assembler. Every test passed — status line, headers,
          blank-line separator, and body, all batched through <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>bufio.Writer</span>.
          Next, you&apos;ll wire this into a router.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28 }}>
          <button onClick={onContinue} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 16px",
            background: "linear-gradient(180deg, var(--primary) 0%, #c21717 100%)",
            border: "none",
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "-0.005em",
            cursor: "pointer",
            boxShadow: "0 2px 14px var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}>
            Continue to next task
            <Icon.ArrowRight size={13} strokeWidth={2.5} />
          </button>
          <button onClick={onDismiss} style={{
            padding: "9px 14px",
            background: "transparent", border: "none",
            color: "var(--text-dim)",
            fontSize: 12,
            cursor: "pointer",
          }}>
            Keep working here
          </button>
          <div style={{ flex: 1 }} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--text-faint)", letterSpacing: "0.1em",
          }}>6 / 10</span>
        </div>
      </div>
    </div>
  );
}

export interface PaletteItem {
  kind: "task" | "file" | "action" | "resource";
  label: string;
  hint: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onJump: (item: PaletteItem) => void;
}

export function CommandPalette({ open, onClose, onJump }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);
  if (!open) return null;

  const items: PaletteItem[] = ([
    { kind: "task", label: "Write the response", hint: "http/response · current" },
    { kind: "task", label: "Parse headers", hint: "http/headers · done" },
    { kind: "task", label: "Middleware chain", hint: "router/middleware · locked" },
    { kind: "file", label: "http/response.go", hint: "Go source · stub" },
    { kind: "file", label: "http/status.go", hint: "Go source" },
    { kind: "file", label: "cmd/server/main.go", hint: "Entry point" },
    { kind: "action", label: "Run tests", hint: "⌘↵" },
    { kind: "action", label: "Toggle test panel", hint: "⌘J" },
    { kind: "action", label: "Toggle focus mode", hint: "⌘." },
    { kind: "action", label: "Open concept map", hint: "⌘G" },
    { kind: "resource", label: "HTTP/1.1 response format", hint: "Doc · available" },
  ] as PaletteItem[]).filter(x => !query || x.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(5,4,4,0.72)", backdropFilter: "blur(8px)",
        display: "flex", justifyContent: "center", paddingTop: "14vh",
        animation: "fade-in 160ms ease-out",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 620, maxWidth: "90vw",
        background: "var(--surface-alt)",
        border: "1px solid var(--border-strong)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px var(--border)",
        display: "flex", flexDirection: "column",
        maxHeight: 480,
        animation: "celebrate-in 220ms cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
        }}>
          <Icon.Search size={14} style={{ color: "var(--text-dim)" }} />
          <input ref={inputRef}
            placeholder="Jump to task, file, or action…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none", outline: "none",
              color: "var(--text)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              letterSpacing: "-0.005em",
            }}
          />
          <kbd style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            padding: "2px 6px", border: "1px solid var(--border-strong)",
            color: "var(--text-dim)",
          }}>esc</kbd>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          {items.length === 0 && (
            <p style={{ padding: "20px 22px", color: "var(--text-dim)", fontSize: 13 }}>
              No matches for &quot;{query}&quot;
            </p>
          )}
          {items.map((it, i) => {
            const kindColor = ({ task: "var(--primary)", file: "var(--info)", action: "var(--warning)", resource: "var(--success)" } as const)[it.kind];
            const KindIcon = ({ task: Icon.Dot, file: Icon.File, action: Icon.Zap, resource: Icon.Book } as const)[it.kind];
            return (
              <button key={i}
                onClick={() => { onJump(it); onClose(); }}
                className="hover-row"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "9px 18px",
                  background: i === 0 ? "var(--surface-hover)" : "transparent",
                  border: "none", color: "inherit",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <KindIcon size={12} style={{ color: kindColor, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "var(--text)" }}>{it.label}</span>
                <span style={{ flex: 1 }} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10.5,
                  color: "var(--text-dim)", letterSpacing: "0.05em",
                }}>{it.hint}</span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`.hover-row:hover { background: var(--surface-hover) !important; }`}</style>
    </div>
  );
}

/* Toast stack */
export interface ToastsProps {
  toasts: Toast[];
}

export function Toasts({ toasts }: ToastsProps) {
  return (
    <div style={{
      position: "fixed", bottom: 18, right: 18,
      display: "flex", flexDirection: "column", gap: 8,
      zIndex: 60, pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          pointerEvents: "auto",
          display: "flex", alignItems: "flex-start", gap: 10,
          minWidth: 260, maxWidth: 340,
          padding: "10px 14px",
          background: "var(--surface-alt)",
          border: "1px solid var(--border-strong)",
          borderLeft: `2px solid ${t.kind === "success" ? "var(--success)" : t.kind === "error" ? "var(--error)" : "var(--info)"}`,
          fontSize: 12,
          color: "var(--text)",
          animation: "slide-up 250ms cubic-bezier(0.16,1,0.3,1)",
        }}>
          {t.kind === "success" ? <Icon.Check size={13} style={{ color: "var(--success)", marginTop: 2 }} strokeWidth={2.5} />
            : t.kind === "error" ? <Icon.X size={13} style={{ color: "var(--error)", marginTop: 2 }} strokeWidth={2.5} />
            : <Icon.Sparkle size={13} style={{ color: "var(--info)", marginTop: 2 }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{t.title}</div>
            {t.body && <div style={{ color: "var(--text-dim)", marginTop: 2 }}>{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
