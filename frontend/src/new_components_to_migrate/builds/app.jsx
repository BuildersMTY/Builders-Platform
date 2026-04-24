/* Builds page — shipped projects gallery, portfolio-style */

const { useState: uBState, useEffect: uBEffect, useMemo: uBMemo } = React;
const { TopNav, LangBadge: BLangBadge } = window.CoursesNav;
const { USER } = window.CoursesData;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "accentHue": 0,
  "view": "gallery",
  "sortBy": "recent"
}/*EDITMODE-END*/;

/* —— Shipped builds, richer than the home-page list —— */
const BUILDS = [
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
function BuildStats({ builds }) {
  const totalLines = builds.reduce((a, b) => a + b.lines, 0);
  const totalTests = builds.reduce((a, b) => a + b.tests, 0);
  const totalHours = builds.reduce((a, b) => a + b.duration_hours, 0);
  const avgGrade = (() => {
    const gradeMap = { "A+": 4.3, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0 };
    const vals = builds.map(b => gradeMap[b.grade] || 3.5);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg >= 4.15) return "A+";
    if (avg >= 3.85) return "A";
    if (avg >= 3.5) return "A-";
    return "B+";
  })();
  const tracks = [...new Set(builds.map(b => b.track))];
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
      {[
        { label: "shipped", value: builds.length, sub: `across ${tracks.length} tracks` },
        { label: "lines of code", value: totalLines.toLocaleString(), sub: null },
        { label: "tests passing", value: totalTests, sub: null },
        { label: "hours spent", value: totalHours, sub: `~${Math.round(totalHours / builds.length)}h / build` },
        { label: "average grade", value: avgGrade, sub: null, primary: true },
      ].map(s => (
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
function GradeChip({ grade }) {
  const color = {
    "A+": "var(--success)",
    "A": "var(--success)",
    "A-": "var(--success)",
    "B+": "var(--warning)",
  }[grade] || "var(--text-muted)";
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
function CodeSnippet({ lines, maxLines = 10 }) {
  const kColor = {
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
            {l.t || "\u00A0"}
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
function BuildCard({ build, onOpen, featured }) {
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
          <BLangBadge lang={build.lang} lang_label={build.lang_label} />
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
function BuildDetail({ build, onClose }) {
  uBEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
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
              <Icon.X size={13} />
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
            <BLangBadge lang={build.lang} lang_label={build.lang_label} />
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
            <Icon.ExternalLink size={11} />
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
            <Icon.Book size={11} />
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
            <Icon.Share size={11} />
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
function BuildsTimeline({ builds, onOpen }) {
  // Group by year-month
  const groups = [];
  let last = null;
  builds.forEach(b => {
    const [monYear] = [b.shipped_on.replace(/,.*$/, "").split(" ").slice(0, 1)[0] + " " + b.shipped_on.split(", ")[1]];
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
                <BLangBadge lang={b.lang} lang_label={b.lang_label} />
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
                <Icon.ArrowRight size={11} style={{ color: "var(--text-faint)" }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ———— Main app ———— */
function BuildsApp() {
  const tweaks = window.useTweaks ? window.useTweaks(DEFAULT_TWEAKS) : [DEFAULT_TWEAKS, () => {}];
  const [tw, setTw] = tweaks;
  const [query, setQuery] = uBState("");
  const [trackFilter, setTrackFilter] = uBState("all");
  const [openBuild, setOpenBuild] = uBState(null);

  uBEffect(() => {
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

  const tracks = uBMemo(() => ["all", ...new Set(BUILDS.map(b => b.track))], []);

  const filtered = uBMemo(() => {
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
    if (tw.sortBy === "recent") out = [...out].sort((a, b) => a.shipped_days_ago - b.shipped_days_ago);
    else if (tw.sortBy === "size") out = [...out].sort((a, b) => b.lines - a.lines);
    else if (tw.sortBy === "grade") {
      const g = { "A+": 5, "A": 4, "A-": 3, "B+": 2 };
      out = [...out].sort((a, b) => (g[b.grade] || 0) - (g[a.grade] || 0));
    }
    return out;
  }, [query, trackFilter, tw.sortBy]);

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
            Everything you've <span style={{ fontStyle: "italic" }}>shipped</span>. <span style={{ color: "var(--text-muted)" }}>Grouped, graded, and grep-able.</span>
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
          {[
            { v: "recent", l: "Most recent" },
            { v: "size", l: "Largest" },
            { v: "grade", l: "Best graded" },
          ].map(s => (
            <button key={s.v} onClick={() => setTw("sortBy", s.v)} style={{
              padding: "6px 10px",
              background: tw.sortBy === s.v ? "var(--surface-active)" : "transparent",
              border: `1px solid ${tw.sortBy === s.v ? "var(--border-bright)" : "var(--border)"}`,
              color: tw.sortBy === s.v ? "var(--text)" : "var(--text-dim)",
              fontSize: 11,
              cursor: "pointer",
            }}>{s.l}</button>
          ))}

          <span style={{ width: 1, height: 18, background: "var(--border)", margin: "0 6px" }} />

          {/* View toggle */}
          <div style={{ display: "flex", gap: 2 }}>
            {[
              { v: "gallery", l: "Gallery" },
              { v: "timeline", l: "Timeline" },
            ].map(s => (
              <button key={s.v} onClick={() => setTw("view", s.v)} style={{
                padding: "6px 10px",
                background: tw.view === s.v ? "var(--surface-active)" : "transparent",
                border: `1px solid ${tw.view === s.v ? "var(--border-bright)" : "var(--border)"}`,
                color: tw.view === s.v ? "var(--text)" : "var(--text-dim)",
                fontSize: 11,
                cursor: "pointer",
              }}>{s.l}</button>
            ))}
          </div>
        </div>

        {/* Gallery vs timeline */}
        {tw.view === "gallery" ? (
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

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Accent">
            <window.TweakSlider label="Hue shift" value={tw.accentHue} min={-40} max={320} step={1} unit="°"
              onChange={v => setTw("accentHue", v)} />
          </window.TweakSection>
          <window.TweakSection label="View">
            <window.TweakRadio label="Layout" value={tw.view}
              options={[
                { value: "gallery", label: "Gallery" },
                { value: "timeline", label: "Timeline" },
              ]}
              onChange={v => setTw("view", v)} />
            <window.TweakRadio label="Sort by" value={tw.sortBy}
              options={[
                { value: "recent", label: "Most recent" },
                { value: "size", label: "Largest" },
                { value: "grade", label: "Best graded" },
              ]}
              onChange={v => setTw("sortBy", v)} />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BuildsApp />);
