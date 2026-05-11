"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

/* ============================================================
 *  Inline icon set — simple SVGs matching the source stroke sizes.
 *  Keeping these local so builds doesn't depend on lucide-react.
 * ========================================================== */
type IconProps = { size?: number; style?: React.CSSProperties };

const IconX = ({ size = 13, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconExternalLink = ({ size = 11, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconBook = ({ size = 11, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconShare = ({ size = 11, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconArrowRight = ({ size = 11, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconSearch = ({ size = 12, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconChevron = ({ size = 10, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ============================================================
 *  LangBadge — ported 1:1 from courses/chrome.jsx
 * ========================================================== */
interface LangBadgeProps {
  lang: string;
  lang_label: string;
  size?: "sm" | "md";
}
function LangBadge({ lang, lang_label, size = "sm" }: LangBadgeProps) {
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
 *  TopNav — ported 1:1 from courses/chrome.jsx,
 *  using next/link and inline icons.
 * ========================================================== */
interface TopNavProps {
  query: string;
  setQuery: (v: string) => void;
  active?: string;
}
function TopNav({ query, setQuery, active = "builds" }: TopNavProps) {
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
        <IconSearch size={12} style={{ color: "var(--text-dim)" }} />
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
        <span style={{ fontSize: 12.5, color: "var(--text)" }}>Raúl</span>
        <IconChevron size={10} style={{ color: "var(--text-dim)", transform: "rotate(90deg)" }} />
      </div>

      <style>{`
        .hover-brighten:hover { background: var(--surface-active) !important; }
      `}</style>
    </header>
  );
}

/* ============================================================
 *  Data
 * ========================================================== */
interface CodeLine {
  t: string;
  k: string;
}
interface Build {
  id: string;
  title: string;
  slug: string;
  course: string;
  track: string;
  lang: string;
  lang_label: string;
  shipped_on: string;
  shipped_days_ago: number;
  lines: number;
  tests: number;
  hash: string;
  duration_hours: number;
  blurb: string;
  grade: string;
  pass_rate: number;
  highlight_code: CodeLine[];
  skills: string[];
  readme_link: string;
  featured?: boolean;
}

const BUILDS: Build[] = [
  {
    id: "dns",
    title: "DNS Resolver in 200 lines",
    slug: "dns-resolver",
    course: "DNS Resolver in 200 lines",
    track: "Networking",
    lang: "python",
    lang_label: "Python",
    shipped_on: "Mar 14, 2026",
    shipped_days_ago: 41,
    lines: 247,
    tests: 34,
    hash: "a3f91c2",
    duration_hours: 11,
    blurb: "Walked the root nameservers, parsed DNS wire format by hand, handled CNAME chains. No dnspython.",
    grade: "A",
    pass_rate: 1.0,
    highlight_code: [
      { t: "def parse_header(data):", k: "def" },
      { t: "    (tx_id, flags, qdcount, ancount,", k: "" },
      { t: "     nscount, arcount) = struct.unpack(", k: "" },
      { t: "        \"!HHHHHH\", data[:12])", k: "str" },
      { t: "    return DNSHeader(", k: "" },
      { t: "        tx_id=tx_id,", k: "" },
      { t: "        response=bool(flags & 0x8000),", k: "num" },
      { t: "        ...", k: "" },
      { t: "    )", k: "" },
    ],
    skills: ["UDP sockets", "struct.pack/unpack", "DNS wire format", "recursion"],
    readme_link: "/builds/dns/README.md",
  },
  {
    id: "markov",
    title: "Markov chain name generator",
    slug: "markov-names",
    course: "Stats & Probability",
    track: "Data",
    lang: "go",
    lang_label: "Go",
    shipped_on: "Jan 19, 2026",
    shipped_days_ago: 95,
    lines: 312,
    tests: 18,
    hash: "c11b7a9",
    duration_hours: 14,
    blurb: "Trigram Markov chain trained on 12k Old Norse names. Generates plausible but fake Viking identities.",
    grade: "A-",
    pass_rate: 0.94,
    highlight_code: [
      { t: "func (m *Chain) Generate() string {", k: "def" },
      { t: "\tvar out []rune", k: "" },
      { t: "\tprev := [2]rune{'^', '^'}", k: "str" },
      { t: "\tfor {", k: "" },
      { t: "\t\tnext := m.sample(prev)", k: "" },
      { t: "\t\tif next == '$' { break }", k: "str" },
      { t: "\t\tout = append(out, next)", k: "" },
      { t: "\t\tprev = [2]rune{prev[1], next}", k: "" },
      { t: "\t}", k: "" },
      { t: "\treturn string(out)", k: "" },
      { t: "}", k: "" },
    ],
    skills: ["string algorithms", "weighted sampling", "maps", "runes"],
    readme_link: "/builds/markov/README.md",
  },
  {
    id: "fizzbuzz-asm",
    title: "FizzBuzz in assembly",
    slug: "fizzbuzz-asm",
    course: "Down to the metal",
    track: "Systems",
    lang: "asm",
    lang_label: "asm",
    shipped_on: "Feb 02, 2026",
    shipped_days_ago: 82,
    lines: 68,
    tests: 5,
    hash: "8e2d401",
    duration_hours: 4,
    blurb: "x86-64 System V, direct syscalls, zero libc. Because sometimes you need to remind yourself that printf isn't free.",
    grade: "A",
    pass_rate: 1.0,
    highlight_code: [
      { t: "section .text", k: "kw" },
      { t: "global _start", k: "kw" },
      { t: "", k: "" },
      { t: "_start:", k: "def" },
      { t: "    mov rcx, 1            ; i = 1", k: "num" },
      { t: ".loop:", k: "def" },
      { t: "    cmp rcx, 101", k: "num" },
      { t: "    je  .done", k: "" },
      { t: "    ; if i % 15 == 0 → Fizzbuzz", k: "" },
      { t: "    mov rax, rcx", k: "" },
      { t: "    xor rdx, rdx", k: "" },
      { t: "    mov rbx, 15", k: "num" },
      { t: "    div rbx", k: "" },
    ],
    skills: ["x86-64", "syscalls", "division", "branching"],
    readme_link: "/builds/fizzbuzz-asm/README.md",
  },
  {
    id: "redis-lite",
    title: "redis-lite — RESP, RDB snapshots, TTLs",
    slug: "redis-lite",
    course: "Build your own Redis",
    track: "Data",
    lang: "rust",
    lang_label: "Rust",
    shipped_on: "Dec 08, 2025",
    shipped_days_ago: 137,
    lines: 1842,
    tests: 89,
    hash: "b42e0f8",
    duration_hours: 58,
    blurb: "A surprising amount of Redis fits in under 2k lines. RESP parser, hash map, LRU eviction, RDB dump/load.",
    grade: "A+",
    pass_rate: 0.98,
    highlight_code: [
      { t: "fn parse_resp(buf: &[u8]) -> Result<(Resp, usize)> {", k: "def" },
      { t: "    match buf[0] {", k: "kw" },
      { t: "        b'+' => parse_simple(buf),", k: "str" },
      { t: "        b'-' => parse_error(buf),", k: "str" },
      { t: "        b':' => parse_int(buf),", k: "str" },
      { t: "        b'$' => parse_bulk(buf),", k: "str" },
      { t: "        b'*' => parse_array(buf),", k: "str" },
      { t: "        c    => Err(Error::bad_prefix(c))", k: "" },
      { t: "    }", k: "" },
      { t: "}", k: "" },
    ],
    skills: ["RESP protocol", "TCP servers", "async I/O", "binary formats"],
    readme_link: "/builds/redis-lite/README.md",
    featured: true,
  },
  {
    id: "lisp",
    title: "A Lisp in a weekend",
    slug: "lisp-weekend",
    course: "Write a Lisp in a weekend",
    track: "Languages",
    lang: "python",
    lang_label: "Python",
    shipped_on: "Nov 03, 2025",
    shipped_days_ago: 172,
    lines: 421,
    tests: 62,
    hash: "7f29d31",
    duration_hours: 9,
    blurb: "Lexer, parser, tree-walking evaluator. Tail-call optimized. Supports closures, quote, and tiny macros.",
    grade: "A",
    pass_rate: 1.0,
    highlight_code: [
      { t: "def eval(expr, env):", k: "def" },
      { t: "    if isinstance(expr, Symbol):", k: "kw" },
      { t: "        return env.lookup(expr)", k: "" },
      { t: "    if not isinstance(expr, list):", k: "kw" },
      { t: "        return expr", k: "" },
      { t: "    op, *args = expr", k: "" },
      { t: "    if op == 'quote':  return args[0]", k: "str" },
      { t: "    if op == 'if':     return eval_if(args, env)", k: "str" },
      { t: "    if op == 'lambda': return Closure(args, env)", k: "str" },
      { t: "    # function application", k: "" },
      { t: "    fn = eval(op, env)", k: "" },
      { t: "    return fn(*[eval(a, env) for a in args])", k: "" },
    ],
    skills: ["recursion", "AST", "closures", "tail calls"],
    readme_link: "/builds/lisp/README.md",
  },
  {
    id: "kvstore",
    title: "LSM-tree key-value store",
    slug: "kvstore",
    course: "Storage engines",
    track: "Data",
    lang: "go",
    lang_label: "Go",
    shipped_on: "Sep 22, 2025",
    shipped_days_ago: 214,
    lines: 2104,
    tests: 116,
    hash: "e901b5a",
    duration_hours: 72,
    blurb: "Memtable + SSTables + bloom filters + leveled compaction. Wrote it once, then re-wrote it after reading the LevelDB paper properly.",
    grade: "A",
    pass_rate: 0.97,
    highlight_code: [
      { t: "func (l *LSM) Put(k, v []byte) error {", k: "def" },
      { t: "\tif err := l.wal.Append(k, v); err != nil {", k: "kw" },
      { t: "\t\treturn err", k: "" },
      { t: "\t}", k: "" },
      { t: "\tl.mem.Set(k, v)", k: "" },
      { t: "\tif l.mem.Size() > l.memThreshold {", k: "kw" },
      { t: "\t\tgo l.flushMemtable()", k: "" },
      { t: "\t}", k: "" },
      { t: "\treturn nil", k: "" },
      { t: "}", k: "" },
    ],
    skills: ["B-trees", "WAL", "bloom filters", "compaction"],
    readme_link: "/builds/kvstore/README.md",
    featured: true,
  },
];

/* ———— Stat / header ———— */
function BuildStats({ builds }: { builds: Build[] }) {
  const totalLines = builds.reduce((a, b) => a + b.lines, 0);
  const totalTests = builds.reduce((a, b) => a + b.tests, 0);
  const totalHours = builds.reduce((a, b) => a + b.duration_hours, 0);
  const avgGrade = (() => {
    const gradeMap: Record<string, number> = { "A+": 4.3, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0 };
    const vals = builds.map(b => gradeMap[b.grade] || 3.5);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg >= 4.15) return "A+";
    if (avg >= 3.85) return "A";
    if (avg >= 3.5) return "A-";
    return "B+";
  })();
  const tracks = [...new Set(builds.map(b => b.track))];
  const items: { label: string; value: React.ReactNode; sub: string | null; primary?: boolean }[] = [
    { label: "shipped", value: builds.length, sub: `across ${tracks.length} tracks` },
    { label: "lines of code", value: totalLines.toLocaleString(), sub: null },
    { label: "tests passing", value: totalTests, sub: null },
    { label: "hours spent", value: totalHours, sub: `~${Math.round(totalHours / builds.length)}h / build` },
    { label: "average grade", value: avgGrade, sub: null, primary: true },
  ];
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
      {items.map(s => (
        <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9.5,
            color: "var(--text-dim)", letterSpacing: "0.2em", textTransform: "uppercase",
          }}>{s.label}</span>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34,
            fontStyle: "italic",
            color: s.primary ? "var(--primary)" : "var(--text)",
            lineHeight: 1,
          }}>{s.value}</span>
          {s.sub && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--text-faint)" }}>
              {s.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ———— Grade chip ———— */
function GradeChip({ grade }: { grade: string }) {
  const color = ({
    "A+": "var(--success)",
    "A": "var(--success)",
    "A-": "var(--success)",
    "B+": "var(--warning)",
  } as Record<string, string>)[grade] || "var(--text-muted)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28,
      background: "var(--bg-deep)",
      border: `1px solid ${color}`,
      color,
      fontFamily: "var(--font-serif)",
      fontSize: 15,
      fontStyle: "italic",
      fontWeight: 500,
      boxShadow: `0 0 8px ${color}33`,
    }}>{grade}</span>
  );
}

/* ———— Code snippet — syntax-tinted ———— */
function CodeSnippet({ lines, maxLines = 10 }: { lines: CodeLine[]; maxLines?: number }) {
  const kColor: Record<string, string> = {
    def: "var(--info)",
    kw: "#c9a4ff",
    str: "#a8c97f",
    num: "#ff9861",
  };
  const shown = lines.slice(0, maxLines);
  return (
    <div style={{
      background: "var(--bg-deep)",
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      lineHeight: 1.65,
      padding: "14px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {shown.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: 12, whiteSpace: "pre" }}>
          <span style={{ color: "var(--text-faint)", width: 18, textAlign: "right", opacity: 0.5, flexShrink: 0 }}>
            {i + 1}
          </span>
          <span style={{ color: kColor[l.k] || "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l.t || " "}
          </span>
        </div>
      ))}
      {lines.length > maxLines && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
          background: "linear-gradient(180deg, transparent 0%, var(--bg-deep) 85%)",
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

/* ———— Build card — gallery view ———— */
function BuildCard({ build, onOpen, featured }: { build: Build; onOpen: (b: Build) => void; featured?: boolean }) {
  return (
    <article style={{
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
      display: "flex", flexDirection: "column",
      cursor: "pointer",
      transition: "all 160ms",
      gridColumn: featured ? "span 2" : "span 1",
    }}
    onClick={() => onOpen(build)}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateY(0)"; }}>

      {/* Header strip */}
      <div style={{
        padding: "14px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LangBadge lang={build.lang} lang_label={build.lang_label} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>{build.track}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
            {build.hash}
          </span>
          <GradeChip grade={build.grade} />
        </div>
      </div>

      {/* Title + blurb */}
      <div style={{ padding: "20px 22px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontSize: featured ? 26 : 20,
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--text)",
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
        }}>{build.title}</h3>
        <p style={{
          margin: 0,
          fontSize: 13,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          maxWidth: featured ? 560 : 420,
        }}>{build.blurb}</p>
      </div>

      {/* Code preview */}
      <div style={{ padding: "0 22px" }}>
        <CodeSnippet lines={build.highlight_code} maxLines={featured ? 9 : 7} />
      </div>

      {/* Footer metrics */}
      <div style={{
        padding: "14px 22px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 16,
      }}>
        <div style={{ display: "flex", gap: 14, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
          <span>{build.lines.toLocaleString()} LOC</span>
          <span>·</span>
          <span>{build.tests} tests</span>
          <span>·</span>
          <span>{build.duration_hours}h</span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
          {build.shipped_on}
        </span>
      </div>
    </article>
  );
}

/* ———— Build detail drawer (slides in from right) ———— */
function BuildDetail({ build, onClose }: { build: Build | null; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!build) return null;
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(5, 4, 4, 0.7)",
      backdropFilter: "blur(4px)",
      zIndex: 50,
      animation: "fade-in 180ms ease",
    }} onClick={onClose}>
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: "min(720px, 90vw)",
        background: "var(--bg)",
        borderLeft: "1px solid var(--border-strong)",
        boxShadow: "-24px 0 60px rgba(0,0,0,0.5)",
        overflow: "auto",
        animation: "slide-in-right 260ms cubic-bezier(.22,.61,.36,1)",
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0,
          padding: "16px 28px",
          background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 100%)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onClose} style={{
              padding: 6,
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex", alignItems: "center",
            }}>
              <IconX size={13} />
            </button>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.14em" }}>
              {build.hash} · /builds/{build.slug}
            </span>
          </div>
          <GradeChip grade={build.grade} />
        </div>

        {/* Hero */}
        <div style={{ padding: "32px 28px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LangBadge lang={build.lang} lang_label={build.lang_label} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {build.track} · {build.course}
            </span>
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 34,
            fontWeight: 400,
            fontStyle: "italic",
            letterSpacing: "-0.015em",
            color: "var(--text)",
            lineHeight: 1.1,
          }}>{build.title}</h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 580 }}>
            {build.blurb}
          </p>

          {/* Metrics grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            marginTop: 12,
            border: "1px solid var(--border-strong)",
            background: "var(--surface-alt)",
          }}>
            {[
              { l: "Lines of code", v: build.lines.toLocaleString() },
              { l: "Tests", v: `${build.tests} (${Math.round(build.pass_rate * 100)}% pass)` },
              { l: "Time spent", v: `${build.duration_hours} hours` },
              { l: "Shipped", v: build.shipped_on },
            ].map((m, i) => (
              <div key={m.l} style={{
                padding: "14px 16px",
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  {m.l}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)" }}>
                  {m.v}
                </span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>
              Skills demonstrated
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {build.skills.map(s => (
                <span key={s} style={{
                  padding: "4px 9px",
                  fontFamily: "var(--font-mono)", fontSize: 10.5,
                  color: "var(--text-muted)",
                  background: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Code section */}
        <div style={{ padding: "0 28px 28px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
            Highlight · from the source
          </div>
          <div style={{ border: "1px solid var(--border-strong)" }}>
            <CodeSnippet lines={build.highlight_code} maxLines={30} />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: "20px 28px 32px",
          borderTop: "1px solid var(--border)",
          display: "flex", gap: 10,
        }}>
          <button style={{
            padding: "10px 16px",
            background: "var(--primary)",
            border: "none",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 0 14px var(--primary-glow)",
          }}>
            <IconExternalLink size={11} />
            Open in workspace
          </button>
          <button style={{
            padding: "10px 16px",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-muted)",
            fontSize: 12.5,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <IconBook size={11} />
            Read README
          </button>
          <button style={{
            padding: "10px 16px",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-muted)",
            fontSize: 12.5,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <IconShare size={11} />
            Share certificate
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

/* ———— Timeline (list view) ———— */
function BuildsTimeline({ builds, onOpen }: { builds: Build[]; onOpen: (b: Build) => void }) {
  // Group by year-month
  const groups: { key: string; label: string; builds: Build[] }[] = [];
  let last: { key: string; label: string; builds: Build[] } | null = null;
  builds.forEach(b => {
    const key = b.shipped_on.split(", ")[1] + "-" + b.shipped_on.substr(0, 3);
    if (!last || last.key !== key) {
      groups.push({ key, label: b.shipped_on.substr(0, 3) + " " + b.shipped_on.split(", ")[1], builds: [b] });
      last = groups[groups.length - 1];
    } else {
      last.builds.push(b);
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {groups.map(g => (
        <div key={g.key}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 14, marginBottom: 12,
          }}>
            <h3 style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--text)",
            }}>{g.label}</h3>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
              {g.builds.length} build{g.builds.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={{
            border: "1px solid var(--border-strong)",
            background: "var(--surface-alt)",
          }}>
            {g.builds.map((b, i) => (
              <div
                key={b.id}
                onClick={() => onOpen(b)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto",
                  alignItems: "center", gap: 18,
                  padding: "16px 20px",
                  borderBottom: i < g.builds.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  transition: "background 140ms",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <LangBadge lang={b.lang} lang_label={b.lang_label} />
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontStyle: "italic", color: "var(--text)" }}>
                    {b.title}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
                    {b.track} · {b.hash} · {b.lines.toLocaleString()} LOC · {b.tests} tests
                  </span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)" }}>
                  {b.duration_hours}h
                </span>
                <GradeChip grade={b.grade} />
                <IconArrowRight size={11} style={{ color: "var(--text-faint)" }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ———— Main app ———— */
export function BuildsApp() {
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [openBuild, setOpenBuild] = useState<Build | null>(null);
  const [view, setView] = useState<"gallery" | "timeline">("gallery");
  const [sortBy, setSortBy] = useState<"recent" | "size" | "grade">("recent");

  const tracks = useMemo(() => ["all", ...new Set(BUILDS.map(b => b.track))], []);

  const filtered = useMemo(() => {
    let out = BUILDS.filter(b => {
      if (trackFilter !== "all" && b.track !== trackFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!b.title.toLowerCase().includes(q) &&
            !b.blurb.toLowerCase().includes(q) &&
            !b.track.toLowerCase().includes(q) &&
            !b.lang_label.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "recent") out = [...out].sort((a, b) => a.shipped_days_ago - b.shipped_days_ago);
    else if (sortBy === "size") out = [...out].sort((a, b) => b.lines - a.lines);
    else if (sortBy === "grade") {
      const g: Record<string, number> = { "A+": 5, "A": 4, "A-": 3, "B+": 2 };
      out = [...out].sort((a, b) => (g[b.grade] || 0) - (g[a.grade] || 0));
    }
    return out;
  }, [query, trackFilter, sortBy]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav query={query} setQuery={setQuery} active="builds" />

      <div style={{
        position: "fixed", bottom: -200, right: -200,
        width: 600, height: 600,
        background: "radial-gradient(circle, var(--primary-dim) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0,
        animation: "ambient-drift 14s ease-in-out infinite",
      }} />

      <main style={{ padding: "28px 36px", maxWidth: 1440, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Builds · shipped portfolio
          </span>
          <h1 style={{
            margin: "8px 0 24px",
            fontFamily: "var(--font-serif)",
            fontSize: 44,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            lineHeight: 1.05,
            maxWidth: 760,
          }}>
            Everything you&apos;ve <span style={{ fontStyle: "italic" }}>shipped</span>. <span style={{ color: "var(--text-muted)" }}>Grouped, graded, and grep-able.</span>
          </h1>
          <BuildStats builds={BUILDS} />
        </div>

        {/* Filter bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 18px",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", gap: 2 }}>
            {tracks.map(t => (
              <button
                key={t}
                onClick={() => setTrackFilter(t)}
                style={{
                  padding: "6px 12px",
                  background: trackFilter === t ? "var(--surface-active)" : "transparent",
                  border: `1px solid ${trackFilter === t ? "var(--border-bright)" : "transparent"}`,
                  color: trackFilter === t ? "var(--text)" : "var(--text-dim)",
                  fontSize: 11.5,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  letterSpacing: "-0.005em",
                }}
              >
                {t === "all" ? "All tracks" : t}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />

          {/* Sort */}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            sort
          </span>
          {([
            { v: "recent", l: "Most recent" },
            { v: "size", l: "Largest" },
            { v: "grade", l: "Best graded" },
          ] as { v: "recent" | "size" | "grade"; l: string }[]).map(s => (
            <button key={s.v} onClick={() => setSortBy(s.v)} style={{
              padding: "6px 10px",
              background: sortBy === s.v ? "var(--surface-active)" : "transparent",
              border: `1px solid ${sortBy === s.v ? "var(--border-bright)" : "var(--border)"}`,
              color: sortBy === s.v ? "var(--text)" : "var(--text-dim)",
              fontSize: 11,
              cursor: "pointer",
            }}>{s.l}</button>
          ))}

          <span style={{ width: 1, height: 18, background: "var(--border)", margin: "0 6px" }} />

          {/* View toggle */}
          <div style={{ display: "flex", gap: 2 }}>
            {([
              { v: "gallery", l: "Gallery" },
              { v: "timeline", l: "Timeline" },
            ] as { v: "gallery" | "timeline"; l: string }[]).map(s => (
              <button key={s.v} onClick={() => setView(s.v)} style={{
                padding: "6px 10px",
                background: view === s.v ? "var(--surface-active)" : "transparent",
                border: `1px solid ${view === s.v ? "var(--border-bright)" : "var(--border)"}`,
                color: view === s.v ? "var(--text)" : "var(--text-dim)",
                fontSize: 11,
                cursor: "pointer",
              }}>{s.l}</button>
            ))}
          </div>
        </div>

        {/* Gallery vs timeline */}
        {view === "gallery" ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 18,
          }}>
            {filtered.map(b => (
              <BuildCard key={b.id} build={b} onOpen={setOpenBuild} featured={b.featured} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "span 2", padding: 60, color: "var(--text-faint)", textAlign: "center", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16 }}>
                No builds match these filters.
              </div>
            )}
          </div>
        ) : (
          <BuildsTimeline builds={filtered} onOpen={setOpenBuild} />
        )}
      </main>

      {openBuild && <BuildDetail build={openBuild} onClose={() => setOpenBuild(null)} />}
    </div>
  );
}
