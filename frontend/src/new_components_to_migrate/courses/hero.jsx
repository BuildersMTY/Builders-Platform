/* Continue building hero + today's drill + milestone */

const { useState: uHState, useEffect: uHEff } = React;
const { LangBadge: HLangBadge } = window.CoursesNav;

function ContinueHero({ active }) {
  return (
    <a
      href="Workspace.html"
      className="hero-card"
      style={{
        display: "grid",
        gridTemplateColumns: "1.15fr 1fr",
        gap: 0,
        textDecoration: "none",
        color: "inherit",
        border: "1px solid var(--border-strong)",
        background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 100%)",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 200ms, transform 200ms",
      }}
    >
      {/* Left — editorial copy */}
      <div style={{ padding: "32px 36px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--primary)", letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>Continue building</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>
            {active.last_session_ago} ago
          </span>
        </div>

        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: 36,
          lineHeight: 1.08,
          letterSpacing: "-0.015em",
          color: "var(--text)",
        }}>
          <span style={{ fontStyle: "italic" }}>{active.sub_title}.</span>
          <span style={{ color: "var(--text-muted)" }}> Pick up where the wire-format headers meet the body.</span>
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--text-dim)", fontSize: 12.5 }}>
          <HLangBadge lang={active.lang} lang_label={active.lang_label} />
          <span>{active.course_title}</span>
          <span style={{ color: "var(--text-faint)" }}>·</span>
          <span>{active.module_title}</span>
        </div>

        {/* Progress + stats strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: "auto", paddingTop: 16 }}>
          <div style={{ flex: 1, maxWidth: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                course progress
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>
                {active.progress_label}
              </span>
            </div>
            <div style={{
              height: 3,
              background: "var(--border)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                width: `${active.progress_pct * 100}%`,
                background: "linear-gradient(90deg, var(--primary) 0%, #ff6b5b 100%)",
                boxShadow: "0 0 8px var(--primary-glow)",
              }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, padding: "8px 14px", background: "var(--bg-deep)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <span style={{ color: "var(--success)" }}>✓{active.tests_pass}</span>
            <span style={{ color: "var(--text-faint)" }}>·</span>
            <span style={{ color: "var(--error)" }}>✗{active.tests_fail}</span>
            <span style={{ color: "var(--text-dim)", marginLeft: 4 }}>of {active.tests_total}</span>
          </div>

          <div style={{ display: "flex", gap: 4, padding: "8px 14px", background: "var(--bg-deep)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ color: "var(--text)" }}>{active.lines_today}</span>
            <span>lines today</span>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          marginTop: 4,
          background: "var(--primary)",
          color: "#fff",
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          fontSize: 13,
          alignSelf: "flex-start",
          boxShadow: "0 4px 24px -8px var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.18)",
          transition: "transform 150ms, box-shadow 150ms",
        }} className="resume-cta">
          <Icon.Play size={11} strokeWidth={2.5} />
          Resume {active.sub_id}
          <span style={{ opacity: 0.6, marginLeft: 4, fontFamily: "var(--font-mono)", fontSize: 11 }}>⌘↵</span>
        </div>
      </div>

      {/* Right — code ghost preview */}
      <div style={{
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-deep)",
        padding: "22px 0 22px",
        display: "flex", flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* File header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 24px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-dim)",
          borderBottom: "1px solid var(--border)",
          marginBottom: 14,
        }}>
          <Icon.File size={11} />
          <span>http/response.go</span>
          <span style={{ color: "var(--text-faint)" }}>·</span>
          <span style={{ color: "var(--warning)" }}>● unsaved</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: "var(--text-faint)" }}>line 41</span>
        </div>

        {/* Ghost lines */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.85, padding: "0 24px" }}>
          {active.file_preview_lines.map((l, i) => (
            <div key={i} style={{
              display: "flex", gap: 14,
              color: l.faint ? "var(--text-faint)" : "var(--text-muted)",
              whiteSpace: "pre",
            }}>
              <span style={{ width: 18, textAlign: "right", color: "var(--text-faint)" }}>{39 + i}</span>
              <span>{l.text || " "}</span>
            </div>
          ))}
          {/* Active line with caret */}
          <div style={{
            display: "flex", gap: 14,
            color: "var(--text)",
            whiteSpace: "pre",
            background: "linear-gradient(90deg, var(--primary-dim) 0%, transparent 100%)",
            borderLeft: "2px solid var(--primary)",
            marginLeft: -2,
          }}>
            <span style={{ width: 18, textAlign: "right", color: "var(--primary)", paddingLeft: 2 }}>45</span>
            <span>
              <span style={{ color: "var(--info)" }}>for</span>
              <span> k, v := </span>
              <span style={{ color: "var(--info)" }}>range</span>
              <span> r.Headers {`{`}</span>
              <span style={{
                display: "inline-block",
                width: 7, height: 14,
                background: "var(--primary)",
                marginLeft: 2, marginBottom: -2,
                animation: "caret-blink 1s infinite",
              }} />
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, color: "var(--text-faint)", whiteSpace: "pre" }}>
            <span style={{ width: 18, textAlign: "right" }}>46</span>
            <span>{"\t\tfmt.Fprintf(bw, \"%s: %s\\r\\n\", k, v)"}</span>
          </div>
        </div>

        {/* Soft gradient fade at bottom */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 80,
          background: "linear-gradient(180deg, transparent 0%, var(--bg-deep) 100%)",
          pointerEvents: "none",
        }} />

        {/* Failing test chip — floats over code */}
        <div style={{
          position: "absolute", right: 16, bottom: 16,
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 11px",
          background: "var(--surface)",
          border: "1px solid var(--error)",
          borderLeft: "2px solid var(--error)",
          fontSize: 11,
          animation: "slide-up 400ms cubic-bezier(0.16,1,0.3,1) 200ms both",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--error)", boxShadow: "0 0 6px var(--error)" }} />
          <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>1 failing</span>
          <span style={{ color: "var(--text)", fontSize: 11 }}>Content-Type maps .css → text/css</span>
        </div>
      </div>

      <style>{`
        .hero-card:hover { border-color: var(--border-bright); }
        .hero-card:hover .resume-cta { transform: translateX(2px); box-shadow: 0 6px 28px -8px var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.25); }
      `}</style>
    </a>
  );
}

function TodayDrillCard({ drill }) {
  return (
    <div style={{
      padding: "20px 22px",
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
      display: "flex", flexDirection: "column", gap: 14,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon.Zap size={12} style={{ color: "var(--warning)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--warning)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Today's drill</span>
      </div>

      <div style={{
        fontFamily: "var(--font-serif)",
        fontSize: 21,
        lineHeight: 1.18,
        color: "var(--text)",
        fontWeight: 400,
      }}>
        {drill.title}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {drill.skills.map(s => (
          <span key={s} style={{
            padding: "2px 7px",
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--text-muted)",
            background: "var(--surface-hover)",
            border: "1px solid var(--border)",
          }}>{s}</span>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
          ~{drill.est_minutes} min · strengthens <span style={{ color: "var(--text-muted)" }}>{drill.tied_to}</span>
        </span>
        <button style={{
          padding: "7px 12px",
          fontSize: 12, color: "var(--text)",
          background: "var(--surface-hover)",
          border: "1px solid var(--border-strong)",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          Start drill
          <Icon.ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

function MilestoneCard({ milestone }) {
  const remaining = milestone.required - milestone.completed;
  return (
    <div style={{
      padding: "20px 22px",
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
      display: "flex", flexDirection: "column", gap: 14,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon.Trophy size={12} style={{ color: "var(--info)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--info)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Milestone</span>
      </div>

      <div style={{
        fontFamily: "var(--font-serif)",
        fontSize: 21,
        lineHeight: 1.18,
        color: "var(--text)",
      }}>
        <span style={{ fontStyle: "italic" }}>Systems</span> Certificate
      </div>

      <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 }}>
        Ship {milestone.required} systems courses to earn the track certificate. {remaining} to go.
      </p>

      {/* Dotted progress */}
      <div style={{ display: "flex", gap: 4, marginTop: "auto" }}>
        {Array.from({ length: milestone.required }).map((_, i) => {
          const active = i < milestone.completed;
          const current = i === milestone.completed;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{
                height: 4,
                background: active ? "var(--success)" : current ? "var(--primary)" : "var(--border)",
                boxShadow: current ? "0 0 8px var(--primary-glow)" : "none",
                animation: current ? "shimmer 2s linear infinite" : "none",
              }} />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                color: active ? "var(--success)" : current ? "var(--primary)" : "var(--text-faint)",
                letterSpacing: "0.08em",
              }}>
                {active ? "done" : current ? "in progress" : "locked"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.CoursesHero = { ContinueHero, TodayDrillCard, MilestoneCard };
