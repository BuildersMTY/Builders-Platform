"use client";

/* Tracks page — deep dives into each track's progression */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/workspace-v2/icons";

/* ============================================================
 * Data (ported from courses/data.jsx — window.CoursesData)
 * ============================================================ */

const USER = {
  handle: "avery",
  display: "Avery",
  joined_days: 42,
  timezone: "PT",
  active_days: 9,
};

interface EnrolledCourse {
  id: string;
  title: string;
  lang: string;
  lang_label: string;
  level: string;
  modules_total?: number;
  modules_done?: number;
  submodules_total?: number;
  submodules_done?: number;
  progress_pct: number;
  next_task: string | null;
  next_module: string | null;
  streak_mention?: boolean;
  active?: boolean;
  hours_spent?: number;
  total_hours?: number;
  completed?: boolean;
  completed_on?: string;
}

const ENROLLED: EnrolledCourse[] = [
  {
    id: "http-server",
    title: "HTTP Server from Scratch",
    lang: "go",
    lang_label: "Go",
    level: "intermediate",
    modules_total: 4,
    modules_done: 2,
    submodules_total: 12,
    submodules_done: 6,
    progress_pct: 0.48,
    next_task: "Write the response",
    next_module: "HTTP parsing",
    streak_mention: false,
    active: true,
    hours_spent: 14,
    total_hours: 32,
  },
  {
    id: "unix-shell",
    title: "Build a Unix Shell",
    lang: "c",
    lang_label: "C",
    level: "intermediate",
    modules_total: 5,
    modules_done: 3,
    submodules_total: 18,
    submodules_done: 11,
    progress_pct: 0.61,
    next_task: "Signal handling (SIGINT)",
    next_module: "Process control",
    hours_spent: 21,
    total_hours: 40,
  },
  {
    id: "sqlite-clone",
    title: "SQLite, from B-tree up",
    lang: "rust",
    lang_label: "Rust",
    level: "advanced",
    modules_total: 6,
    modules_done: 1,
    submodules_total: 24,
    submodules_done: 3,
    progress_pct: 0.12,
    next_task: "Parser: SELECT statement",
    next_module: "Tokenizer & parser",
    hours_spent: 6,
    total_hours: 60,
  },
  {
    id: "dns-resolver",
    title: "DNS Resolver in 200 lines",
    lang: "python",
    lang_label: "Python",
    level: "beginner",
    modules_total: 3,
    modules_done: 3,
    submodules_total: 9,
    submodules_done: 9,
    progress_pct: 1.0,
    next_task: null,
    next_module: null,
    completed: true,
    hours_spent: 9,
    total_hours: 9,
    completed_on: "Mar 14",
  },
];

interface TrackCourse {
  id: string;
  title: string;
  lang: string;
  lang_label: string;
  hours: number;
  level: "beginner" | "intermediate" | "advanced";
  enrolled?: boolean;
  completed?: boolean;
  builds: number;
}

interface Track {
  id: string;
  title: string;
  subtitle: string;
  courses: TrackCourse[];
}

const TRACKS: Track[] = [
  {
    id: "systems",
    title: "Systems",
    subtitle: "How the machine actually works",
    courses: [
      { id: "http-server", title: "HTTP Server from Scratch", lang: "go", lang_label: "Go", hours: 32, level: "intermediate", enrolled: true, builds: 3842 },
      { id: "unix-shell", title: "Build a Unix Shell", lang: "c", lang_label: "C", hours: 40, level: "intermediate", enrolled: true, builds: 2156 },
      { id: "tcp-stack", title: "TCP/IP from the wire up", lang: "rust", lang_label: "Rust", hours: 58, level: "advanced", builds: 891 },
      { id: "malloc", title: "Write your own malloc", lang: "c", lang_label: "C", hours: 18, level: "intermediate", builds: 1204 },
      { id: "docker", title: "Containers without Docker", lang: "go", lang_label: "Go", hours: 24, level: "advanced", builds: 612 },
    ],
  },
  {
    id: "data",
    title: "Data",
    subtitle: "Storage engines, indexes, query planners",
    courses: [
      { id: "sqlite-clone", title: "SQLite, from B-tree up", lang: "rust", lang_label: "Rust", hours: 60, level: "advanced", enrolled: true, builds: 524 },
      { id: "log-engine", title: "Append-only log engine", lang: "go", lang_label: "Go", hours: 28, level: "intermediate", builds: 1188 },
      { id: "query-planner", title: "A toy query planner", lang: "python", lang_label: "Python", hours: 16, level: "beginner", builds: 944 },
      { id: "redis-clone", title: "A Redis-compatible cache", lang: "go", lang_label: "Go", hours: 32, level: "intermediate", builds: 2771 },
    ],
  },
  {
    id: "networking",
    title: "Networking",
    subtitle: "Protocols, packets, the fabric",
    courses: [
      { id: "dns-resolver", title: "DNS Resolver in 200 lines", lang: "python", lang_label: "Python", hours: 9, level: "beginner", enrolled: true, completed: true, builds: 4210 },
      { id: "torrent", title: "BitTorrent client", lang: "go", lang_label: "Go", hours: 40, level: "advanced", builds: 738 },
      { id: "websocket", title: "WebSockets, RFC 6455", lang: "rust", lang_label: "Rust", hours: 22, level: "intermediate", builds: 1402 },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    subtitle: "Interpreters, compilers, type systems",
    courses: [
      { id: "lisp", title: "Write a Lisp in a weekend", lang: "python", lang_label: "Python", hours: 12, level: "beginner", builds: 3998 },
      { id: "monkey", title: "Tree-walking interpreter", lang: "go", lang_label: "Go", hours: 36, level: "intermediate", builds: 1721 },
      { id: "wasm", title: "A WASM VM", lang: "rust", lang_label: "Rust", hours: 64, level: "advanced", builds: 342 },
    ],
  },
];

/* ============================================================
 * Tweaks / defaults
 * ============================================================ */

const DEFAULT_TWEAKS = {
  accentHue: 0,
  activeTrack: "systems",
};

/* ============================================================
 * Track metadata — positioning copy, skills, certificate
 * ============================================================ */

interface TrackMeta {
  id: string;
  title: string;
  tagline: string;
  blurb: string;
  skills: string[];
  cert_title: string;
  cert_required: number;
  icon: string;
  glyph_color: string;
}

const TRACK_META: Record<string, TrackMeta> = {
  systems: {
    id: "systems",
    title: "Systems",
    tagline: "How the machine actually works.",
    blurb: "Operating systems, memory allocators, network stacks, containers. The stuff running underneath everything you've ever used — you'll build it from first principles.",
    skills: ["Manual memory management", "Concurrency primitives", "Syscalls & ABIs", "Signal handling", "File descriptors", "Binary protocols"],
    cert_title: "Systems Engineer",
    cert_required: 4,
    icon: "cpu",
    glyph_color: "#7ed5d0",
  },
  data: {
    id: "data",
    title: "Data",
    tagline: "Storage engines, indexes, query planners.",
    blurb: "Build the guts of a database. B-trees, LSM trees, write-ahead logs, query planners — the ideas that make terabytes feel like nothing.",
    skills: ["B-tree & LSM trees", "Append-only logs", "Query parsing", "Cost-based planning", "Transactions & MVCC", "Indexes"],
    cert_title: "Data Engineer",
    cert_required: 3,
    icon: "database",
    glyph_color: "#ff9861",
  },
  networking: {
    id: "networking",
    title: "Networking",
    tagline: "Protocols, packets, the fabric.",
    blurb: "From DNS to BitTorrent. Understand the wire format of the internet by implementing it piece by piece — then use that understanding to debug the real one.",
    skills: ["UDP & TCP sockets", "Protocol state machines", "Binary parsing", "RFC comprehension", "Retransmission & congestion", "Encryption basics"],
    cert_title: "Network Engineer",
    cert_required: 3,
    icon: "network",
    glyph_color: "#7aa7ff",
  },
  languages: {
    id: "languages",
    title: "Languages",
    tagline: "Interpreters, compilers, type systems.",
    blurb: "Write a Lisp in a weekend. Then a tree-walking interpreter. Then a bytecode VM. By the end you'll see every programming language as a tree of small decisions.",
    skills: ["Lexing & parsing", "AST walking", "Bytecode VMs", "Type checking", "Garbage collection", "JIT basics"],
    cert_title: "Language Designer",
    cert_required: 3,
    icon: "braces",
    glyph_color: "#c9a4ff",
  },
};

/* Build progression: split courses into difficulty tiers */
interface Tier {
  level: "beginner" | "intermediate" | "advanced";
  label: string;
  courses: TrackCourse[];
}

function tierCourses(courses: TrackCourse[]): Tier[] {
  const tiers: Tier[] = [
    { level: "beginner", label: "Foundations", courses: courses.filter(c => c.level === "beginner") },
    { level: "intermediate", label: "Core", courses: courses.filter(c => c.level === "intermediate") },
    { level: "advanced", label: "Mastery", courses: courses.filter(c => c.level === "advanced") },
  ];
  return tiers.filter(t => t.courses.length > 0);
}

/* ============================================================
 * LangBadge — inlined from courses/chrome.jsx
 * ============================================================ */

function LangBadge({ lang, lang_label, size = "sm" }: { lang: string; lang_label: string; size?: "sm" | "md" }) {
  const hues: Record<string, string> = {
    go: "#7ed5d0",
    rust: "#ff9861",
    python: "#f5d86a",
    c: "#9bb7ff",
    asm: "#c9a4ff",
  };
  const color = hues[lang] || "var(--text-muted)";
  const padding = size === "sm" ? "2px 7px" : "3px 9px";
  const font = size === "sm" ? 10.5 : 11.5;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding, fontFamily: "var(--font-mono)",
      fontSize: font, letterSpacing: "0.04em",
      color,
      border: `1px solid ${color}33`,
      background: `${color}0d`,
      textTransform: "lowercase",
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}99` }} />
      {lang_label}
    </span>
  );
}

/* ============================================================
 * TopNav — inlined from courses/chrome.jsx
 * ============================================================ */

function TopNav({ query, setQuery, active = "tracks" }: { query: string; setQuery: (v: string) => void; active?: string }) {
  const tabs = [
    { id: "courses", label: "Courses", href: "/courses" },
    { id: "tracks", label: "Tracks", href: "/tracks" },
    { id: "practice", label: "Practice", href: "/practice" },
    { id: "builds", label: "Builds", href: "/builds" },
  ];
  return (
    <header
      className="noise-bg"
      style={{
        display: "flex", alignItems: "center", gap: 20,
        padding: "0 28px",
        height: 56,
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 100%)",
        position: "sticky", top: 0, zIndex: 5,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link href="/courses" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/builderslogo2.svg" alt="" width="24" height="24" style={{ opacity: 0.95 }} />
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          letterSpacing: "0.01em",
          color: "var(--text)",
          fontStyle: "italic",
          fontWeight: 500,
        }}>
          Buildmancer
        </span>
      </Link>

      <div style={{ width: 1, height: 18, background: "var(--border-strong)" }} />

      {/* Tabs */}
      <nav style={{ display: "flex", gap: 2 }}>
        {tabs.map(t => (
          <Link
            key={t.id}
            href={t.href}
            className="nav-tab"
            data-active={t.id === active}
            style={{
              padding: "8px 14px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              letterSpacing: "-0.005em",
              color: t.id === active ? "var(--text)" : "var(--text-dim)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              position: "relative",
              textDecoration: "none",
            }}
          >
            {t.label}
            {t.id === active && (
              <span style={{
                position: "absolute", left: 14, right: 14, bottom: -1,
                height: 1.5,
                background: "var(--primary)",
                boxShadow: "0 0 8px var(--primary-glow)",
              }} />
            )}
          </Link>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px",
        background: "var(--surface-hover)",
        border: "1px solid var(--border)",
        width: 280,
      }}>
        <Icon.Search size={12} style={{ color: "var(--text-dim)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a course, track, or skill…"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text)",
            fontSize: 12.5,
            fontFamily: "var(--font-sans)",
          }}
        />
        <kbd style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          padding: "1px 5px",
          border: "1px solid var(--border-strong)",
          background: "var(--bg-deep)",
          color: "var(--text-muted)",
        }}>⌘K</kbd>
      </div>

      {/* Profile */}
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "4px 10px 4px 4px",
        background: "var(--surface-hover)",
        border: "1px solid var(--border)",
        cursor: "pointer",
      }} className="hover-brighten">
        <div style={{
          width: 26, height: 26,
          background: "linear-gradient(135deg, #ff2b2b 0%, #ff6b5b 100%)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 13,
          fontWeight: 500,
          color: "#fff",
        }}>A</div>
        <span style={{ fontSize: 12.5, color: "var(--text)" }}>{USER.display}</span>
        <Icon.Chevron size={10} style={{ color: "var(--text-dim)", transform: "rotate(90deg)" }} />
      </div>

      <style>{`
        .hover-brighten:hover { background: var(--surface-active) !important; }
      `}</style>
    </header>
  );
}

/* ============================================================
 * Track glyph — SVG mark per track, big and decorative
 * ============================================================ */

function TrackGlyph({ id, color, size = 64 }: { id: string; color: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    systems: (
      <g>
        <rect x="12" y="12" width="40" height="40" stroke={color} fill="none" strokeWidth="1.3" />
        <rect x="22" y="22" width="20" height="20" stroke={color} fill="none" strokeWidth="1.3" opacity="0.6" />
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={20 + i * 8} y1="6" x2={20 + i * 8} y2="12" stroke={color} strokeWidth="1.3" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <line key={`b${i}`} x1={20 + i * 8} y1="52" x2={20 + i * 8} y2="58" stroke={color} strokeWidth="1.3" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <line key={`l${i}`} x1="6" y1={20 + i * 8} x2="12" y2={20 + i * 8} stroke={color} strokeWidth="1.3" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <line key={`r${i}`} x1="52" y1={20 + i * 8} x2="58" y2={20 + i * 8} stroke={color} strokeWidth="1.3" />
        ))}
      </g>
    ),
    data: (
      <g>
        <ellipse cx="32" cy="16" rx="20" ry="6" stroke={color} fill="none" strokeWidth="1.3" />
        <path d="M 12 16 L 12 32 A 20 6 0 0 0 52 32 L 52 16" stroke={color} fill="none" strokeWidth="1.3" />
        <path d="M 12 32 L 12 48 A 20 6 0 0 0 52 48 L 52 32" stroke={color} fill="none" strokeWidth="1.3" />
        <ellipse cx="32" cy="32" rx="20" ry="6" stroke={color} fill="none" strokeWidth="1.3" opacity="0.5" strokeDasharray="2 2" />
        <ellipse cx="32" cy="48" rx="20" ry="6" stroke={color} fill="none" strokeWidth="1.3" opacity="0.5" strokeDasharray="2 2" />
      </g>
    ),
    networking: (
      <g>
        {[[16, 16], [48, 16], [32, 32], [16, 48], [48, 48]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        ))}
        <line x1="16" y1="16" x2="32" y2="32" stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1="48" y1="16" x2="32" y2="32" stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1="32" y1="32" x2="16" y2="48" stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1="32" y1="32" x2="48" y2="48" stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1="16" y1="16" x2="48" y2="48" stroke={color} strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
        <line x1="48" y1="16" x2="16" y2="48" stroke={color} strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
      </g>
    ),
    languages: (
      <g>
        <path d="M 20 12 C 12 12 12 20 12 32 C 12 44 12 52 20 52" stroke={color} fill="none" strokeWidth="1.5" />
        <path d="M 44 12 C 52 12 52 20 52 32 C 52 44 52 52 44 52" stroke={color} fill="none" strokeWidth="1.5" />
        <line x1="22" y1="26" x2="42" y2="26" stroke={color} strokeWidth="1" opacity="0.7" />
        <line x1="22" y1="32" x2="42" y2="32" stroke={color} strokeWidth="1" opacity="0.5" />
        <line x1="22" y1="38" x2="42" y2="38" stroke={color} strokeWidth="1" opacity="0.7" />
      </g>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {paths[id]}
    </svg>
  );
}

/* ============================================================
 * Track selector — column of 4 tracks
 * ============================================================ */

function TrackList({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {TRACKS.map(t => {
        const meta = TRACK_META[t.id];
        const isActive = t.id === active;
        const enrolled = t.courses.filter(c => ENROLLED.find(e => e.id === c.id)).length;
        const completed = t.courses.filter(c => ENROLLED.find(e => e.id === c.id && e.completed)).length;
        return (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px",
              background: isActive ? "var(--surface-active)" : "var(--surface)",
              border: `1px solid ${isActive ? "var(--border-bright)" : "var(--border)"}`,
              borderLeft: `2px solid ${isActive ? meta.glyph_color : "transparent"}`,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 160ms",
              color: "inherit",
              fontFamily: "inherit",
            }}
          >
            <TrackGlyph id={t.id} color={meta.glyph_color} size={38} />
            <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
              <span style={{
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                fontStyle: "italic",
                color: isActive ? "var(--text)" : "var(--text-muted)",
              }}>{meta.title}</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-faint)",
                letterSpacing: "0.04em",
              }}>
                {t.courses.length} courses · {enrolled} enrolled · {completed} shipped
              </span>
            </div>
            {isActive && <Icon.Chevron size={11} style={{ color: "var(--text-dim)" }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Course in track (progression view)
 * ============================================================ */

function TrackCourseRow({ course, index, isLast }: { course: TrackCourse; index: number; isLast: boolean }) {
  const enrolled = ENROLLED.find(e => e.id === course.id);
  const pct = enrolled ? enrolled.progress_pct : 0;
  const status: "shipped" | "in-progress" | "available" =
    enrolled?.completed ? "shipped" : enrolled ? "in-progress" : "available";
  const statusColor: Record<typeof status, string> = {
    shipped: "var(--success)",
    "in-progress": "var(--primary)",
    available: "var(--text-faint)",
  };
  const sc = statusColor[status];
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "36px 1fr auto auto",
      alignItems: "center", gap: 18,
      padding: "16px 0",
      borderBottom: isLast ? "none" : "1px solid var(--border)",
      position: "relative",
    }}>
      {/* Index + connector line */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "center" }}>
        {!isLast && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 1,
            height: "100%",
            transform: "translateX(-50%)",
            background: "var(--border)",
            zIndex: 0,
          }} />
        )}
        <div style={{
          width: 28, height: 28,
          background: status === "available" ? "var(--bg)" : "var(--surface-active)",
          border: `1px solid ${sc}`,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: sc,
          position: "relative",
          zIndex: 1,
          fontWeight: 500,
        }}>
          {status === "shipped" ? <Icon.Check size={12} strokeWidth={2.5} /> : index + 1}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LangBadge lang={course.lang} lang_label={course.lang_label} />
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "var(--text)",
            fontStyle: status === "available" ? "italic" : "normal",
          }}>
            {course.title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
          <span>{course.hours}h</span>
          <span>·</span>
          <span>{course.builds.toLocaleString()} built</span>
          {enrolled && !enrolled.completed && (
            <>
              <span>·</span>
              <span style={{ color: "var(--primary)" }}>next: {enrolled.next_task}</span>
            </>
          )}
        </div>
      </div>

      {/* Progress ring */}
      <div style={{ width: 36, height: 36, position: "relative" }}>
        <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="18" cy="18" r="15" stroke="var(--border)" strokeWidth="1.5" fill="none" />
          <circle cx="18" cy="18" r="15" stroke={sc} strokeWidth="1.5" fill="none"
            strokeDasharray={`${2 * Math.PI * 15}`}
            strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct)}`}
            style={{ transition: "stroke-dashoffset 400ms" }} />
        </svg>
        <span style={{
          position: "absolute", inset: 0,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          color: status === "available" ? "var(--text-faint)" : "var(--text-muted)",
        }}>{Math.round(pct * 100)}%</span>
      </div>

      <Link href={course.id === "http-server" ? "/workspace-v2" : "#"} style={{
        padding: "7px 12px",
        background: status === "available" ? "var(--surface-hover)" : "var(--surface-active)",
        border: `1px solid ${status === "available" ? "var(--border)" : "var(--border-strong)"}`,
        color: status === "available" ? "var(--text-muted)" : "var(--text)",
        fontSize: 11.5,
        textDecoration: "none",
        display: "flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-sans)",
      }}>
        {status === "shipped" ? "Review" : status === "in-progress" ? "Continue" : "Start"}
        <Icon.ArrowRight size={10} />
      </Link>
    </div>
  );
}

/* ============================================================
 * Main detail panel for selected track
 * ============================================================ */

function TrackDetail({ track }: { track: Track }) {
  const meta = TRACK_META[track.id];
  const tiers = tierCourses(track.courses);
  const shipped = track.courses.filter(c => ENROLLED.find(e => e.id === c.id && e.completed)).length;
  const certProgress = shipped / meta.cert_required;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Hero */}
      <div style={{
        display: "flex", gap: 28,
        padding: "28px 32px",
        border: "1px solid var(--border-strong)",
        background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Track glyph */}
        <div style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 96, height: 96, position: "relative" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle, ${meta.glyph_color}22 0%, transparent 70%)`,
          }} />
          <TrackGlyph id={track.id} color={meta.glyph_color} size={80} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: 36,
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}>
              {meta.title}
            </h1>
            <span style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "var(--font-serif)" }}>
              {meta.tagline}
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: 13.5,
            color: "var(--text-muted)",
            lineHeight: 1.6,
            maxWidth: 620,
          }}>
            {meta.blurb}
          </p>

          {/* Skills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {meta.skills.map(s => (
              <span key={s} style={{
                padding: "3px 8px",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "var(--text-muted)",
                background: "var(--surface-hover)",
                border: "1px solid var(--border)",
                letterSpacing: "0.01em",
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Certificate card */}
        <div style={{
          flexShrink: 0,
          width: 240,
          padding: "18px 20px",
          background: "var(--bg-deep)",
          border: "1px solid var(--border-strong)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon.Trophy size={11} style={{ color: meta.glyph_color }} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: meta.glyph_color,
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}>
              Certificate
            </span>
          </div>
          <div style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            color: "var(--text)",
          }}>
            <span style={{ fontStyle: "italic" }}>{meta.cert_title}</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
            Ship {meta.cert_required} courses to earn it.
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {Array.from({ length: meta.cert_required }).map((_, i) => (
              <div key={i} style={{
                flex: 1,
                height: 3,
                background: i < shipped ? meta.glyph_color : "var(--border)",
                boxShadow: i < shipped ? `0 0 6px ${meta.glyph_color}88` : "none",
              }} />
            ))}
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
            {shipped} / {meta.cert_required} shipped · {Math.round(certProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Progression tiers */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {tiers.map(tier => (
          <section key={tier.level}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
              <h3 style={{
                margin: 0,
                fontFamily: "var(--font-serif)",
                fontSize: 20,
                fontWeight: 400,
                fontStyle: "italic",
                color: "var(--text)",
              }}>{tier.label}</h3>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {tier.level}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border)", alignSelf: "center" }} />
            </div>
            <div style={{
              padding: "0 20px",
              border: "1px solid var(--border-strong)",
              background: "var(--surface-alt)",
            }}>
              {tier.courses.map((c, i) => (
                <TrackCourseRow key={c.id} course={c} index={i} isLast={i === tier.courses.length - 1} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * TracksApp — entry
 * ============================================================ */

export function TracksApp() {
  const [tw, setTw] = useState(DEFAULT_TWEAKS);
  const [query, setQuery] = useState("");

  // Accent hue
  useEffect(() => {
    const root = document.documentElement;
    if (tw.accentHue !== 0) {
      root.style.setProperty("--primary", `hsl(${(360 + tw.accentHue) % 360}, 100%, 58%)`);
      root.style.setProperty("--primary-hover", `hsl(${(360 + tw.accentHue) % 360}, 100%, 65%)`);
      root.style.setProperty("--primary-dim", `hsla(${(360 + tw.accentHue) % 360}, 100%, 58%, 0.14)`);
      root.style.setProperty("--primary-glow", `hsla(${(360 + tw.accentHue) % 360}, 100%, 58%, 0.35)`);
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-hover");
      root.style.removeProperty("--primary-dim");
      root.style.removeProperty("--primary-glow");
    }
  }, [tw.accentHue]);

  const activeTrack = TRACKS.find(t => t.id === tw.activeTrack) || TRACKS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav query={query} setQuery={setQuery} active="tracks" />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -200, right: -200,
        width: 600, height: 600,
        background: "radial-gradient(circle, var(--primary-dim) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0,
        animation: "ambient-drift 14s ease-in-out infinite",
      }} />

      <main style={{ padding: "28px 36px", maxWidth: 1440, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--text-dim)", letterSpacing: "0.2em", textTransform: "uppercase",
            }}>
              Tracks · {TRACKS.length}
            </span>
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 40,
            fontWeight: 400,
            letterSpacing: "-0.015em",
            color: "var(--text)",
            maxWidth: 720,
            lineHeight: 1.1,
          }}>
            Pick a <span style={{ fontStyle: "italic" }}>trade</span>. <span style={{ color: "var(--text-muted)" }}>Ship the courses in it. Earn the certificate.</span>
          </h1>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 24,
          alignItems: "flex-start",
        }}>
          <div style={{ position: "sticky", top: 76 }}>
            <TrackList active={tw.activeTrack} setActive={(v) => setTw({ ...tw, activeTrack: v })} />
          </div>
          <TrackDetail track={activeTrack} />
        </div>
      </main>
    </div>
  );
}
