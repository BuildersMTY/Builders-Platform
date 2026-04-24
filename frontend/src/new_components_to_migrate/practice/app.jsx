/* Practice page — drills, daily challenge, streaks */

const { useState: uPState, useEffect: uPEffect, useMemo: uPMemo } = React;
const { TopNav, LangBadge: PLangBadge } = window.CoursesNav;
const { USER } = window.CoursesData;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "accentHue": 0,
  "difficulty": "all",
  "showLeaderboard": true
}/*EDITMODE-END*/;

/* ———— Drills data — inline to this page ———— */
const DAILY_DRILL = {
  id: "daily-2026-04-24",
  title: "Implement a token bucket rate limiter",
  tagline: "Small, mean, and seen in every production API.",
  difficulty: "medium",
  est_minutes: 18,
  lang: "go",
  lang_label: "Go",
  released: "2026-04-24",
  players_today: 1842,
  avg_time: "14m 22s",
  your_best: null,
  skills: ["concurrency", "timers", "sync.Mutex"],
  prompt_lines: [
    { t: "package ratelimit", f: false },
    { t: "", f: true },
    { t: "// Build a TokenBucket that refills `rate` tokens per second", f: true },
    { t: "// up to `capacity`. Allow(n) returns true if n tokens are", f: true },
    { t: "// available right now (and consumes them), false otherwise.", f: true },
    { t: "", f: true },
    { t: "type TokenBucket struct {", f: false },
    { t: "\t// TODO", f: true },
    { t: "}", f: false },
  ],
};

const DRILL_CATEGORIES = [
  { id: "all",        label: "All drills",      count: 247 },
  { id: "strings",    label: "Strings & parsing", count: 52 },
  { id: "concurrency",label: "Concurrency",     count: 38 },
  { id: "bits",       label: "Bit twiddling",   count: 29 },
  { id: "trees",      label: "Trees & graphs",  count: 41 },
  { id: "io",         label: "I/O & syscalls",  count: 34 },
  { id: "math",       label: "Numerics",        count: 27 },
  { id: "protocols",  label: "Protocol parsing", count: 26 },
];

const DRILLS = [
  { id: "utf8",        title: "Decode a UTF-8 code point",        cat: "strings",    lang: "rust", lang_label: "Rust", difficulty: "easy",   minutes: 6,  done: true,  solved_pct: 0.89 },
  { id: "ring",        title: "Ring buffer with resize",          cat: "io",         lang: "c",    lang_label: "C",    difficulty: "medium", minutes: 12, done: true,  solved_pct: 0.61 },
  { id: "ipv4",        title: "Parse an IPv4 address (no regex)", cat: "strings",    lang: "go",   lang_label: "Go",   difficulty: "easy",   minutes: 8,  done: true,  solved_pct: 0.82 },
  { id: "tokenbucket", title: "Token bucket rate limiter",        cat: "concurrency",lang: "go",   lang_label: "Go",   difficulty: "medium", minutes: 18, done: false, solved_pct: 0.54, daily: true },
  { id: "popcount",    title: "popcount without builtins",         cat: "bits",       lang: "c",    lang_label: "C",    difficulty: "easy",   minutes: 7,  done: false, solved_pct: 0.73 },
  { id: "skiplist",    title: "Skip list insert",                  cat: "trees",      lang: "rust", lang_label: "Rust", difficulty: "hard",   minutes: 35, done: false, solved_pct: 0.24 },
  { id: "fd-select",   title: "select() over N file descriptors", cat: "io",         lang: "c",    lang_label: "C",    difficulty: "medium", minutes: 22, done: false, solved_pct: 0.41 },
  { id: "tcp-retrans", title: "TCP retransmission timer",         cat: "protocols",  lang: "go",   lang_label: "Go",   difficulty: "hard",   minutes: 40, done: false, solved_pct: 0.18 },
  { id: "varint",      title: "Varint encode/decode",             cat: "protocols",  lang: "rust", lang_label: "Rust", difficulty: "medium", minutes: 15, done: false, solved_pct: 0.58 },
  { id: "fixed-point", title: "Fixed-point square root",          cat: "math",       lang: "c",    lang_label: "C",    difficulty: "medium", minutes: 20, done: false, solved_pct: 0.37 },
  { id: "lru",         title: "LRU cache",                        cat: "trees",      lang: "go",   lang_label: "Go",   difficulty: "medium", minutes: 20, done: true,  solved_pct: 0.68 },
  { id: "crc32",       title: "CRC32 without tables",             cat: "bits",       lang: "rust", lang_label: "Rust", difficulty: "hard",   minutes: 28, done: false, solved_pct: 0.29 },
];

/* 30-day streak calendar */
const STREAK_DAYS = (() => {
  const rand = (seed) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
  const r = rand(99);
  const days = 30;
  const arr = [];
  for (let i = 0; i < days; i++) {
    const recency = i / days;
    const v = r();
    if (v < 0.15 + (1 - recency) * 0.25) arr.push(0);
    else if (v < 0.5) arr.push(1);
    else arr.push(2); // 2 = solved multiple drills
  }
  arr[days - 1] = 1; // today, in progress
  return arr;
})();

const LEADERBOARD = [
  { rank: 1,  handle: "serial_clam",     drills: 182, streak: 47 },
  { rank: 2,  handle: "heap_underflow",  drills: 171, streak: 41 },
  { rank: 3,  handle: "segfault_sally",  drills: 168, streak: 38 },
  { rank: 4,  handle: "big_o_nothing",   drills: 154, streak: 35 },
  { rank: 5,  handle: "kern_el_panic",   drills: 149, streak: 29 },
  { rank: 18, handle: "avery",           drills: 63,  streak: 12, you: true },
];

/* ———— Daily drill hero ———— */
function DailyDrillHero({ drill }) {
  const [started, setStarted] = uPState(false);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr",
      gap: 0,
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
      overflow: "hidden",
    }}>
      {/* Left: prompt */}
      <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            padding: "3px 8px",
            background: "var(--primary-dim)",
            border: "1px solid var(--primary)",
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--primary)",
            letterSpacing: "0.2em", textTransform: "uppercase",
            boxShadow: "0 0 10px var(--primary-glow)",
          }}>Daily</div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
            {drill.released} · {drill.players_today.toLocaleString()} players today
          </span>
        </div>
        <h2 style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontSize: 34,
          fontWeight: 400,
          fontStyle: "italic",
          letterSpacing: "-0.015em",
          lineHeight: 1.1,
          color: "var(--text)",
        }}>{drill.title}</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {drill.tagline}
        </p>
        <div style={{ display: "flex", gap: 18, marginTop: 4, flexWrap: "wrap" }}>
          <Stat label="difficulty" value={drill.difficulty} color="var(--warning)" />
          <Stat label="estimated" value={`${drill.est_minutes}m`} />
          <Stat label="median time" value={drill.avg_time} />
          <Stat label="skills" value={drill.skills.join(" · ")} />
        </div>
        <button
          onClick={() => setStarted(true)}
          style={{
            marginTop: 10,
            alignSelf: "flex-start",
            padding: "10px 20px",
            background: "var(--primary)",
            border: "none",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            boxShadow: "0 0 18px var(--primary-glow)",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {started ? "Resume drill" : "Start drill"}
          <Icon.ArrowRight size={11} />
        </button>
      </div>

      {/* Right: ghost code preview */}
      <div style={{
        background: "var(--bg-deep)",
        padding: "20px 24px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        lineHeight: 1.75,
        borderLeft: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          paddingBottom: 12,
          borderBottom: "1px solid var(--border)",
          marginBottom: 12,
          fontSize: 10.5,
          color: "var(--text-faint)",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warning)" }} />
          ratelimit.go
          <span style={{ marginLeft: "auto", color: "var(--text-dim)" }}>{drill.lang_label}</span>
        </div>
        {drill.prompt_lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 14, color: l.f ? "var(--text-faint)" : "var(--text-muted)", whiteSpace: "pre" }}>
            <span style={{ color: "var(--text-faint)", width: 18, textAlign: "right", opacity: 0.5 }}>{i + 1}</span>
            <span>{l.t || "\u00A0"}</span>
          </div>
        ))}
        {/* Fade */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 50,
          background: "linear-gradient(180deg, transparent 0%, var(--bg-deep) 90%)",
          pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 12.5, color: color || "var(--text)", fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

/* ———— Streak calendar — 30 days horizontal ———— */
function StreakCalendar({ days }) {
  const today = days.length - 1;
  const current = (() => {
    let s = 0;
    for (let i = today; i >= 0; i--) {
      if (days[i] > 0) s++; else break;
    }
    return s;
  })();
  const longest = (() => {
    let best = 0, run = 0;
    for (const d of days) { if (d > 0) { run++; best = Math.max(best, run); } else run = 0; }
    return best;
  })();
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14,
      padding: "18px 22px",
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Streak
          </span>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontStyle: "italic", color: "var(--primary)" }}>
            {current} days
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
            best: {longest}
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
          last 30 days
        </span>
      </div>
      <div style={{ display: "flex", gap: 3, height: 42 }}>
        {days.map((d, i) => {
          const isToday = i === today;
          const bg = d === 0
            ? "var(--border)"
            : d === 1
              ? "rgba(255, 43, 43, 0.45)"
              : "rgba(255, 43, 43, 0.8)";
          return (
            <div key={i} style={{
              flex: 1,
              background: bg,
              border: isToday ? "1px solid var(--primary)" : "1px solid transparent",
              boxShadow: d >= 2 ? "0 0 6px var(--primary-glow)" : "none",
              position: "relative",
            }} title={d === 0 ? "no practice" : `${d} drill${d > 1 ? "s" : ""}`}>
              {isToday && (
                <div style={{
                  position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
                  fontFamily: "var(--font-mono)", fontSize: 8.5, color: "var(--primary)",
                  letterSpacing: "0.1em",
                }}>TODAY</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ———— Category sidebar ———— */
function CategorySidebar({ active, setActive }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{
        padding: "0 2px 10px",
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--text-dim)",
        letterSpacing: "0.18em", textTransform: "uppercase",
      }}>
        Categories
      </div>
      {DRILL_CATEGORIES.map(c => (
        <button
          key={c.id}
          onClick={() => setActive(c.id)}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 12px",
            background: c.id === active ? "var(--surface-active)" : "transparent",
            border: "none",
            borderLeft: `2px solid ${c.id === active ? "var(--primary)" : "transparent"}`,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit",
            color: c.id === active ? "var(--text)" : "var(--text-muted)",
            fontSize: 13,
            transition: "all 120ms",
          }}
        >
          <span>{c.label}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
            {c.count}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ———— Drill card ———— */
function DrillCard({ drill }) {
  const diffColor = {
    easy: "var(--success)",
    medium: "var(--warning)",
    hard: "var(--error)",
  }[drill.difficulty];
  return (
    <div style={{
      padding: "16px 18px",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      display: "flex", flexDirection: "column", gap: 12,
      cursor: "pointer",
      transition: "all 160ms",
      position: "relative",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      {drill.daily && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          padding: "2px 6px",
          fontFamily: "var(--font-mono)", fontSize: 8.5,
          color: "var(--primary)",
          background: "var(--primary-dim)",
          border: "1px solid var(--primary)",
          letterSpacing: "0.18em", textTransform: "uppercase",
        }}>Daily</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PLangBadge lang={drill.lang} lang_label={drill.lang_label} />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: diffColor,
          letterSpacing: "0.14em", textTransform: "uppercase",
        }}>{drill.difficulty}</span>
        {drill.done && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
            <Icon.Check size={10} strokeWidth={2.5} />
            solved
          </span>
        )}
      </div>
      <h3 style={{
        margin: 0,
        fontFamily: "var(--font-serif)",
        fontSize: 16,
        fontWeight: 400,
        color: drill.done ? "var(--text-muted)" : "var(--text)",
        lineHeight: 1.3,
      }}>
        {drill.title}
      </h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
          <span>{drill.minutes}m</span>
          <span>·</span>
          <span>{Math.round(drill.solved_pct * 100)}% solve</span>
        </div>
        <Icon.ArrowRight size={11} style={{ color: "var(--text-faint)" }} />
      </div>
      {/* Solve rate bar */}
      <div style={{ height: 2, background: "var(--border)", position: "relative" }}>
        <div style={{
          height: "100%",
          width: `${drill.solved_pct * 100}%`,
          background: drill.solved_pct > 0.7 ? "var(--success)" : drill.solved_pct > 0.4 ? "var(--warning)" : "var(--error)",
          opacity: 0.7,
        }} />
      </div>
    </div>
  );
}

/* ———— Leaderboard ———— */
function Leaderboard({ rows }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
    }}>
      <div style={{
        padding: "12px 18px",
        borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Leaderboard · this week
        </span>
        <a href="#" style={{ fontSize: 11, color: "var(--text-faint)", textDecoration: "none" }}>full board</a>
      </div>
      {rows.map((r, i) => (
        <div key={r.handle} style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr auto auto",
          alignItems: "center", gap: 14,
          padding: "10px 18px",
          borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
          background: r.you ? "var(--primary-dim)" : "transparent",
          borderLeft: r.you ? "2px solid var(--primary)" : "2px solid transparent",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: r.rank <= 3 ? "var(--primary)" : "var(--text-faint)",
            fontWeight: r.rank <= 3 ? 500 : 400,
          }}>
            {String(r.rank).padStart(2, "0")}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 12.5,
            color: r.you ? "var(--text)" : "var(--text-muted)",
            fontWeight: r.you ? 500 : 400,
          }}>
            {r.handle}{r.you && <span style={{ color: "var(--primary)", marginLeft: 6 }}>you</span>}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
            {r.drills} drills
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--primary)" }}>
            🔥 {r.streak}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ———— Main app ———— */
function PracticeApp() {
  const tweaks = window.useTweaks ? window.useTweaks(DEFAULT_TWEAKS) : [DEFAULT_TWEAKS, () => {}];
  const [tw, setTw] = tweaks;
  const [query, setQuery] = uPState("");
  const [activeCat, setActiveCat] = uPState("all");

  uPEffect(() => {
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

  const filtered = uPMemo(() => DRILLS.filter(d => {
    if (activeCat !== "all" && d.cat !== activeCat) return false;
    if (tw.difficulty !== "all" && d.difficulty !== tw.difficulty) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.lang_label.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [activeCat, tw.difficulty, query]);

  const solved = DRILLS.filter(d => d.done).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav query={query} setQuery={setQuery} active="practice" />

      <div style={{
        position: "fixed", top: -200, left: -200,
        width: 600, height: 600,
        background: "radial-gradient(circle, var(--primary-dim) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0,
        animation: "ambient-drift 14s ease-in-out infinite",
      }} />

      <main style={{ padding: "28px 36px", maxWidth: 1440, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Practice
            </span>
            <h1 style={{
              margin: "8px 0 0",
              fontFamily: "var(--font-serif)",
              fontSize: 40,
              fontWeight: 400,
              letterSpacing: "-0.015em",
              color: "var(--text)",
              lineHeight: 1.1,
            }}>
              Sharpen. <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>One drill a day.</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "flex-end", flexShrink: 0 }}>
            <Stat label="solved" value={`${solved} / ${DRILLS.length}`} />
            <Stat label="this week" value="7 drills" />
            <Stat label="avg time" value="14m 8s" />
          </div>
        </div>

        {/* Row 1: Daily + Streak */}
        <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
          <DailyDrillHero drill={DAILY_DRILL} />
          <StreakCalendar days={STREAK_DAYS} />
        </section>

        {/* Row 2: Browse drills */}
        <section style={{
          display: "grid",
          gridTemplateColumns: tw.showLeaderboard ? "200px 1fr 280px" : "200px 1fr",
          gap: 24,
          alignItems: "flex-start",
        }}>
          <CategorySidebar active={activeCat} setActive={setActiveCat} />

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{
                margin: 0,
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                fontWeight: 400,
                fontStyle: "italic",
                color: "var(--text)",
              }}>
                {DRILL_CATEGORIES.find(c => c.id === activeCat)?.label}
                <span style={{ fontStyle: "normal", fontSize: 13, color: "var(--text-faint)", marginLeft: 10, fontFamily: "var(--font-mono)" }}>
                  {filtered.length} drills
                </span>
              </h2>
              {/* Difficulty filter */}
              <div style={{ display: "flex", gap: 2 }}>
                {["all", "easy", "medium", "hard"].map(d => (
                  <button key={d} onClick={() => setTw("difficulty", d)} style={{
                    padding: "5px 10px",
                    background: tw.difficulty === d ? "var(--surface-active)" : "transparent",
                    border: `1px solid ${tw.difficulty === d ? "var(--border-bright)" : "var(--border)"}`,
                    color: tw.difficulty === d ? "var(--text)" : "var(--text-dim)",
                    fontFamily: "var(--font-mono)", fontSize: 10.5,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}>{d}</button>
                ))}
              </div>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}>
              {filtered.map(d => <DrillCard key={d.id} drill={d} />)}
              {filtered.length === 0 && (
                <div style={{ padding: 40, color: "var(--text-faint)", textAlign: "center", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                  No drills match these filters.
                </div>
              )}
            </div>
          </div>

          {tw.showLeaderboard && (
            <div style={{ position: "sticky", top: 76, display: "flex", flexDirection: "column", gap: 14 }}>
              <Leaderboard rows={LEADERBOARD} />
              {/* Next badge */}
              <div style={{
                padding: "16px 18px",
                border: "1px solid var(--border-strong)",
                background: "var(--surface-alt)",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Next badge
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44,
                    display: "grid", placeItems: "center",
                    background: "var(--bg-deep)",
                    border: "1px solid var(--warning)",
                    boxShadow: "0 0 10px rgba(255, 179, 71, 0.2)",
                  }}>
                    <Icon.Trophy size={18} style={{ color: "var(--warning)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontStyle: "italic", color: "var(--text)" }}>
                      Metronome
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
                      14 day streak · 2 to go
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 3,
                      background: i < 12 ? "var(--warning)" : "var(--border)",
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Accent">
            <window.TweakSlider label="Hue shift" value={tw.accentHue} min={-40} max={320} step={1} unit="°"
              onChange={v => setTw("accentHue", v)} />
          </window.TweakSection>
          <window.TweakSection label="Filters">
            <window.TweakRadio label="Difficulty" value={tw.difficulty}
              options={[
                { value: "all", label: "All" },
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
              onChange={v => setTw("difficulty", v)} />
          </window.TweakSection>
          <window.TweakSection label="Layout">
            <window.TweakToggle label="Show leaderboard" value={tw.showLeaderboard}
              onChange={v => setTw("showLeaderboard", v)} />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PracticeApp />);
