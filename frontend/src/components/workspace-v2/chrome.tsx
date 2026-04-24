"use client";

import React, { useState, type ReactNode } from "react";
import { Icon } from "./icons";
import type { Course, Module, Submodule } from "./types";

export interface ContextBarProps {
  course: Course;
  activeModule: Module;
  activeSub: Submodule;
  passedCount: number;
  totalCount: number;
  onOpenPalette: () => void;
  streak?: number;
}

export function ContextBar({ course, activeModule, activeSub, passedCount, totalCount, onOpenPalette }: ContextBarProps) {
  const progressPct = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  return (
    <div
      className="context-bar noise-bg"
      style={{
        display: "flex",
        height: 44,
        alignItems: "center",
        gap: 14,
        padding: "0 14px 0 16px",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 100%)",
        position: "relative",
        zIndex: 3,
      }}
    >
      {/* Logo + back */}
      <a
        href="Courses.html"
        style={{
          display: "flex", alignItems: "center", gap: 10,
          flexShrink: 0,
          textDecoration: "none",
          padding: "4px 8px 4px 4px",
          marginLeft: -6,
          transition: "background 150ms",
          color: "inherit",
        }}
        className="hover-brighten"
        title="Back to courses"
      >
        <div style={{ position: "relative", display: "grid", placeItems: "center", width: 22, height: 22 }}>
          <img src="assets/builderslogo2.svg" alt="" width="22" height="22" style={{ opacity: 0.95, transition: "opacity 150ms" }} className="logo-hover" />
          <Icon.ArrowLeft size={14} strokeWidth={1.8} className="back-arrow-hover" style={{
            position: "absolute",
            color: "var(--text)",
            opacity: 0,
            transition: "opacity 150ms",
          }} />
        </div>
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          letterSpacing: "0.01em",
          color: "var(--text)",
          fontStyle: "italic",
          fontWeight: 500,
        }}>
          Buildmancer
        </span>
      </a>
      <style>{`
        a:hover .logo-hover { opacity: 0; }
        a:hover .back-arrow-hover { opacity: 1 !important; }
      `}</style>

      <div style={{ width: 1, height: 16, background: "var(--border-strong)", flexShrink: 0 }} />

      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "0 1 auto" }}>
        <span style={{ fontSize: 12, color: "var(--text-dim)", letterSpacing: "-0.005em" }}>
          {course.title}
        </span>
        <Icon.Chevron size={10} strokeWidth={1.5} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{activeModule.title}</span>
        <Icon.Chevron size={10} strokeWidth={1.5} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
        <span style={{
          fontSize: 12, color: "var(--text)", fontWeight: 500,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            display: "inline-block", width: 5, height: 5, borderRadius: "50%",
            background: "var(--primary)",
            boxShadow: "0 0 8px var(--primary-glow)",
          }} />
          {activeSub.title}
        </span>
      </nav>

      <div style={{ flex: 1 }} />

      {/* Progress display — sectioned bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            progress
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text)",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 500,
          }}>
            {passedCount}<span style={{ color: "var(--text-faint)" }}>/{totalCount}</span>
          </span>
        </div>
        <div style={{
          width: 110, height: 4,
          background: "var(--surface-hover)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            width: `${progressPct}%`,
            background: "linear-gradient(90deg, var(--primary) 0%, #ff6b5b 100%)",
            boxShadow: "0 0 10px var(--primary-glow)",
            transition: "width 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }} />
        </div>
      </div>

      <div style={{ width: 1, height: 16, background: "var(--border-strong)", flexShrink: 0 }} />

      {/* Command palette trigger */}
      <button
        onClick={onOpenPalette}
        className="hover-brighten"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 8px 5px 10px",
          background: "var(--surface-hover)",
          border: "1px solid var(--border)",
          color: "var(--text-dim)",
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          transition: "all 150ms",
        }}
      >
        <Icon.Search size={12} />
        <span>Jump to…</span>
        <kbd style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          padding: "1px 5px",
          border: "1px solid var(--border-strong)",
          background: "var(--bg-deep)",
          color: "var(--text-muted)",
        }}>⌘K</kbd>
      </button>
    </div>
  );
}

export interface RailButtonProps {
  icon: ReactNode;
  active?: boolean;
  accent?: boolean;
  pulse?: boolean;
  label: string;
  caption?: string;
  shortcut?: string;
  onClick?: () => void;
}

export function RailButton({ icon, active, accent, pulse, label, caption, shortcut, onClick }: RailButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%" }}
         onMouseEnter={() => setHover(true)}
         onMouseLeave={() => setHover(false)}>
      <button
        onClick={onClick}
        title={shortcut ? `${label} (${shortcut})` : label}
        aria-label={label}
        style={{
          position: "relative",
          width: "100%",
          padding: caption ? "9px 0 7px" : "10px 0",
          background: accent
            ? "linear-gradient(180deg, var(--primary) 0%, #d91f1f 100%)"
            : active
              ? "var(--bg)"
              : hover
                ? "var(--surface-hover)"
                : "transparent",
          border: "none",
          borderLeft: accent ? "none" : `2px solid ${active ? "var(--primary)" : "transparent"}`,
          color: accent ? "#fff" : active ? "var(--text)" : "var(--text-dim)",
          cursor: "pointer",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3,
          transition: "background 150ms, color 150ms",
          boxShadow: accent ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {pulse && !accent && (
          <span style={{
            position: "absolute", inset: 0,
            border: "1px solid var(--primary)",
            animation: "pulse-ring 2s ease-in-out infinite",
            pointerEvents: "none",
          }} />
        )}
        {accent && pulse && (
          <span style={{
            position: "absolute",
            inset: -3,
            background: "var(--primary)",
            opacity: 0.3,
            animation: "pulse-ring 1.8s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}
        {icon}
        {caption && (
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8.5,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            opacity: accent ? 1 : active ? 1 : 0.7,
          }}>
            {caption}
          </span>
        )}
      </button>
      {/* Tooltip */}
      {hover && label && (
        <div style={{
          position: "absolute",
          left: "calc(100% + 6px)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "var(--bg-deep)",
          border: "1px solid var(--border-strong)",
          padding: "5px 9px",
          fontSize: 11,
          color: "var(--text)",
          whiteSpace: "nowrap",
          zIndex: 100,
          fontFamily: "var(--font-sans)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
          animation: "fade-in 120ms ease-out",
        }}>
          {label}
          {shortcut && (
            <kbd style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "0 4px",
              border: "1px solid var(--border-strong)",
              color: "var(--text-muted)",
            }}>{shortcut}</kbd>
          )}
        </div>
      )}
    </div>
  );
}

export interface IconRailProps {
  panelView: string | null;
  setPanelView: (v: string | null) => void;
  onRun: () => void;
  neverRun?: boolean;
  onOpenGraph: () => void;
}

export function IconRail({ panelView, setPanelView, onRun, neverRun, onOpenGraph }: IconRailProps) {
  const toggle = (v: string) => setPanelView(panelView === v ? null : v);
  return (
    <div style={{
      width: 54,
      flexShrink: 0,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "4px 0",
    }}>
      <RailButton icon={<Icon.Package size={16} />} active={panelView === "modules"} label="Modules" caption="mod" shortcut="⌘1" onClick={() => toggle("modules")} />
      <RailButton icon={<Icon.Folder size={16} />} active={panelView === "files"} label="Files" caption="fs" shortcut="⌘2" onClick={() => toggle("files")} />
      <RailButton icon={<Icon.Book size={16} />} active={panelView === "resources"} label="Resources" caption="docs" shortcut="⌘3" onClick={() => toggle("resources")} />

      <div style={{ height: 1, margin: "6px 10px", background: "var(--border)" }} />

      <RailButton
        icon={<Icon.Constellation size={16} />}
        label="Concept map"
        caption="map"
        shortcut="⌘G"
        onClick={onOpenGraph}
      />

      <div style={{ flex: 1 }} />

      <div style={{ height: 1, margin: "6px 10px", background: "var(--border)" }} />

      <RailButton
        icon={<Icon.Play size={18} strokeWidth={2} />}
        accent
        pulse={neverRun}
        label="Run tests"
        caption="run"
        shortcut="⌘↵"
        onClick={onRun}
      />
      <RailButton icon={<Icon.Home size={15} />} label="Exit to courses" caption="exit" onClick={() => { if (typeof window !== "undefined") window.location.href = "Courses.html"; }} />
    </div>
  );
}
