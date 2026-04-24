/* Tracks page — deep dives into each track's progression */

const { useState: uTState, useMemo: uTMemo } = React;
const { TRACKS, ENROLLED } = window.CoursesData;
const { TopNav, LangBadge: TLangBadge } = window.CoursesNav;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "accentHue": 0,
  "activeTrack": "systems"
}/*EDITMODE-END*/;

/* Track metadata — positioning copy, skills, certificate */
const TRACK_META = {
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
function tierCourses(courses) {
  const tiers = [
    { level: "beginner", label: "Foundations", courses: courses.filter(c => c.level === "beginner") },
    { level: "intermediate", label: "Core", courses: courses.filter(c => c.level === "intermediate") },
    { level: "advanced", label: "Mastery", courses: courses.filter(c => c.level === "advanced") },
  ];
  return tiers.filter(t => t.courses.length > 0);
}

/* —— Track glyph — SVG mark per track, big and decorative —— */
function TrackGlyph({ id, color, size = 64 }) {
  const paths = {
    systems: (
      <g>
        <rect x="12" y="12" width="40" height="40" stroke={color} fill="none" strokeWidth="1.3" />
        <rect x="22" y="22" width="20" height="20" stroke={color} fill="none" strokeWidth="1.3" opacity="0.6" />
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={20 + i * 8} y1="6" x2={20 + i * 8} y2="12" stroke={color} strokeWidth="1.3" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={20 + i * 8} y1="52" x2={20 + i * 8} y2="58" stroke={color} strokeWidth="1.3" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="6" y1={20 + i * 8} x2="12" y2={20 + i * 8} stroke={color} strokeWidth="1.3" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="52" y1={20 + i * 8} x2="58" y2={20 + i * 8} stroke={color} strokeWidth="1.3" />
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

/* —— Track selector — column of 4 tracks —— */
function TrackList({ active, setActive }) {
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

/* —— Course in track (progression view) —— */
function TrackCourseRow({ course, index, isLast }) {
  const enrolled = ENROLLED.find(e => e.id === course.id);
  const pct = enrolled ? enrolled.progress_pct : 0;
  const status = enrolled?.completed ? "shipped" : enrolled ? "in-progress" : "available";
  const statusColor = { shipped: "var(--success)", "in-progress": "var(--primary)", available: "var(--text-faint)" }[status];
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
          border: `1px solid ${statusColor}`,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: statusColor,
          position: "relative",
          zIndex: 1,
          fontWeight: 500,
        }}>
          {status === "shipped" ? <Icon.Check size={12} strokeWidth={2.5} /> : index + 1}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TLangBadge lang={course.lang} lang_label={course.lang_label} />
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
          <circle cx="18" cy="18" r="15" stroke={statusColor} strokeWidth="1.5" fill="none"
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

      <a href={course.id === "http-server" ? "Workspace.html" : "#"} style={{
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
      </a>
    </div>
  );
}

/* —— Main detail panel for selected track —— */
function TrackDetail({ track }) {
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

function TracksApp() {
  const tweaks = window.useTweaks ? window.useTweaks(DEFAULT_TWEAKS) : [DEFAULT_TWEAKS, () => {}];
  const [tw, setTw] = tweaks;
  const [query, setQuery] = uTState("");

  // Accent hue
  React.useEffect(() => {
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
            <TrackList active={tw.activeTrack} setActive={(v) => setTw("activeTrack", v)} />
          </div>
          <TrackDetail track={activeTrack} />
        </div>
      </main>

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Accent">
            <window.TweakSlider label="Hue shift" value={tw.accentHue} min={-40} max={320} step={1} unit="°"
              onChange={v => setTw("accentHue", v)} />
          </window.TweakSection>
          <window.TweakSection label="Active track">
            <window.TweakRadio label="Track" value={tw.activeTrack}
              options={TRACKS.map(t => ({ value: t.id, label: TRACK_META[t.id].title }))}
              onChange={v => setTw("activeTrack", v)} />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<TracksApp />);
