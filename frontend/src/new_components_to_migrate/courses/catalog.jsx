/* Enrolled course cards, track catalog, activity stream, builds list */

const { useState: uCatState, useRef: uCatRef } = React;
const { LangBadge } = window.CoursesNav;

/* ———————— Enrolled course card ———————— */
function EnrolledCard({ course, isActive }) {
  const done = course.completed;
  return (
    <a
      href={course.id === "http-server" ? "Workspace.html" : "#"}
      className="enrolled-card"
      style={{
        display: "flex", flexDirection: "column",
        padding: "18px 20px 16px",
        border: "1px solid " + (isActive ? "var(--border-bright)" : "var(--border-strong)"),
        background: isActive
          ? "linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 100%)"
          : "var(--surface)",
        gap: 12,
        textDecoration: "none", color: "inherit",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 160ms, transform 160ms",
        cursor: course.id === "http-server" ? "pointer" : "default",
      }}
    >
      {isActive && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          display: "flex", alignItems: "center", gap: 5,
          padding: "2px 7px",
          background: "var(--primary-dim)",
          border: "1px solid rgba(255,43,43,0.3)",
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          color: "var(--primary)",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 5px var(--primary-glow)" }} />
          active
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LangBadge lang={course.lang} lang_label={course.lang_label} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)", letterSpacing: "0.04em" }}>
          {course.level}
        </span>
      </div>

      <div style={{
        fontFamily: "var(--font-serif)",
        fontSize: 19,
        lineHeight: 1.2,
        color: "var(--text)",
        fontWeight: 400,
        maxWidth: "90%",
      }}>
        {course.title}
      </div>

      {!done && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>next</span>
            <span style={{ color: "var(--text)" }}>{course.next_task}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>in {course.next_module}</div>
        </div>
      )}

      {done && (
        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon.Check size={12} strokeWidth={2.5} style={{ color: "var(--success)" }} />
          <span style={{ fontSize: 12, color: "var(--success)" }}>Shipped</span>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>· {course.completed_on}</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Footer: progress bar + numbers */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <div style={{ flex: 1, height: 2, background: "var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            width: `${course.progress_pct * 100}%`,
            background: done
              ? "var(--success)"
              : isActive
                ? "linear-gradient(90deg, var(--primary) 0%, #ff6b5b 100%)"
                : "var(--text-muted)",
            boxShadow: isActive ? "0 0 6px var(--primary-glow)" : "none",
          }} />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)", minWidth: 32, textAlign: "right" }}>
          {Math.round(course.progress_pct * 100)}%
        </span>
      </div>
      <div style={{
        display: "flex", gap: 10,
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--text-faint)",
        letterSpacing: "0.04em",
      }}>
        <span>{course.submodules_done}/{course.submodules_total} tasks</span>
        <span>·</span>
        <span>{course.hours_spent}h / {course.total_hours}h</span>
      </div>

      <style>{`
        .enrolled-card:hover { border-color: var(--border-bright); transform: translateY(-1px); }
      `}</style>
    </a>
  );
}

/* ———————— Catalog card (smaller, for horizontal rail) ———————— */
function CatalogCard({ course }) {
  return (
    <div
      className="catalog-card"
      style={{
        width: 248, flexShrink: 0,
        padding: "16px 18px 14px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative",
        cursor: "pointer",
        transition: "border-color 160ms, background 160ms, transform 160ms",
      }}
    >
      {course.enrolled && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          padding: "1px 5px",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: course.completed ? "var(--success)" : "var(--info)",
          background: course.completed ? "var(--success-dim)" : "rgba(122,167,255,0.08)",
          border: `1px solid ${course.completed ? "rgba(111,214,184,0.3)" : "rgba(122,167,255,0.3)"}`,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>{course.completed ? "shipped" : "enrolled"}</div>
      )}

      <LangBadge lang={course.lang} lang_label={course.lang_label} />

      <div style={{
        fontFamily: "var(--font-serif)",
        fontSize: 16,
        lineHeight: 1.22,
        color: "var(--text)",
        minHeight: 38,
      }}>
        {course.title}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.02em" }}>
        <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <Icon.Clock size={10} />
          {course.hours}h
        </span>
        <span>{course.level}</span>
        <span style={{ color: "var(--text-faint)" }}>
          {course.builds.toLocaleString()} built
        </span>
      </div>

      <style>{`
        .catalog-card:hover { border-color: var(--border-strong); background: var(--surface-alt); transform: translateY(-1px); }
      `}</style>
    </div>
  );
}

/* ———————— Track row with horizontal scroll rail ———————— */
function TrackRow({ track }) {
  const scrollRef = uCatRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 14 }}>
        <h3 style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          fontWeight: 400,
          color: "var(--text)",
          fontStyle: "italic",
          letterSpacing: "-0.01em",
        }}>
          {track.title}
        </h3>
        <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{track.subtitle}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => scroll(-1)} style={navBtnStyle}><Icon.Chevron size={11} style={{ transform: "rotate(180deg)" }} /></button>
          <button onClick={() => scroll(1)} style={navBtnStyle}><Icon.Chevron size={11} /></button>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          display: "flex", gap: 12,
          overflowX: "auto",
          scrollbarWidth: "none",
          paddingBottom: 4,
        }}
        className="track-scroll"
      >
        {track.courses.map(c => <CatalogCard key={c.id} course={c} />)}
      </div>

      <style>{`
        .track-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

const navBtnStyle = {
  display: "grid", placeItems: "center",
  width: 24, height: 24,
  background: "var(--surface-hover)",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
  cursor: "pointer",
};

/* ———————— Activity stream (terminal-ticker feel) ———————— */
function ActivityStream({ items }) {
  const kindConfig = {
    test_pass: { dot: "var(--success)", label: "pass" },
    test_fail: { dot: "var(--error)",   label: "fail" },
    sub_done:  { dot: "var(--primary)", label: "done" },
    module:    { dot: "var(--info)",    label: "unlock" },
    resource:  { dot: "var(--text-muted)", label: "read" },
    build:     { dot: "var(--warning)", label: "ship" },
  };
  return (
    <div style={{
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--text-dim)",
        letterSpacing: "0.18em", textTransform: "uppercase",
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 5px var(--success)" }} />
        Activity — last 7 days
      </div>
      <div style={{
        display: "flex", flexDirection: "column",
        padding: "6px 0",
        maxHeight: 260,
        overflowY: "auto",
      }}>
        {items.map((a, i) => {
          const cfg = kindConfig[a.kind] || kindConfig.sub_done;
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "52px 48px 1fr",
              alignItems: "baseline", gap: 10,
              padding: "6px 16px",
              borderBottom: i < items.length - 1 ? "1px dashed var(--border)" : "none",
              fontSize: 12,
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)", letterSpacing: "0.02em" }}>
                {a.when}
              </span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: cfg.dot,
                letterSpacing: "0.1em",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: cfg.dot }} />
                {cfg.label}
              </span>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--text)" }}>{a.text}</span>
                <span style={{ color: "var(--text-faint)" }}> · {a.course}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ———————— Builds list — certificate-like ———————— */
function BuildsList({ builds }) {
  return (
    <div style={{
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--text-dim)",
        letterSpacing: "0.18em", textTransform: "uppercase",
      }}>
        <Icon.Trophy size={10} style={{ color: "var(--warning)" }} />
        Builds shipped
        <span style={{ flex: 1 }} />
        <span style={{ letterSpacing: "0.02em", textTransform: "none", color: "var(--text-faint)" }}>
          {builds.length} total
        </span>
      </div>
      {builds.map((b, i) => (
        <div key={b.hash} style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center", gap: 16,
          padding: "12px 16px",
          borderBottom: i < builds.length - 1 ? "1px solid var(--border)" : "none",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--text)", fontStyle: "italic" }}>
              {b.title}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
              {b.hash} · {b.lines} LOC · {b.tests} tests
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)", letterSpacing: "0.02em" }}>
            {b.shipped_on}
          </span>
          <Icon.ArrowRight size={12} style={{ color: "var(--text-faint)" }} />
        </div>
      ))}
    </div>
  );
}

/* ———————— Activity heatmap — GitHub-style contribution grid ———————— */
function ActivityHeatmap({ counts }) {
  // counts is an array of N days, newest-last.
  // Pack into a 7-row grid (day-of-week), right-aligned to today.
  const total = counts.reduce((a, b) => a + b, 0);
  const active = counts.filter(c => c > 0).length;
  const max = Math.max(...counts, 1);

  // Today is index counts.length - 1, we want it in the last column.
  // Assume today's day-of-week index (0=Sun .. 6=Sat); we'll fake it to Tuesday.
  const todayDow = 2; // Tue — arbitrary but deterministic

  // Build columns (weeks): left-to-right, each column is 7 cells top-to-bottom (Sun → Sat).
  // Start by figuring out what DOW the oldest day is.
  const daysCount = counts.length;
  const oldestDow = (todayDow - (daysCount - 1) % 7 + 7 * 100) % 7;

  // Pad front so column 0 starts on Sunday.
  const frontPad = oldestDow;
  // Pad back so last column ends on todayDow = last day shown aligns.
  const totalLen = frontPad + daysCount;
  const backPad = (7 - (totalLen % 7)) % 7;
  const cells = [
    ...Array(frontPad).fill(null),
    ...counts,
    ...Array(backPad).fill(null),
  ];
  const weeks = cells.length / 7;

  // Compute intensity bucket (0-4) for each cell — GitHub uses 5 levels.
  const bucket = (c) => {
    if (c == null) return -1;
    if (c === 0) return 0;
    const p = c / max;
    if (p < 0.25) return 1;
    if (p < 0.5) return 2;
    if (p < 0.75) return 3;
    return 4;
  };

  const bucketBg = (b) => {
    if (b === -1) return "transparent";
    if (b === 0) return "var(--border)";
    // tint from low to high
    const alphas = [0, 0.2, 0.4, 0.65, 0.9];
    return `rgba(255, 43, 43, ${alphas[b]})`;
  };

  // Month labels — each month-start column gets labeled.
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  // today is Apr 24 (arbitrary) — rewind by daysCount days
  const today = new Date();
  const startDate = new Date(today.getTime() - (daysCount - 1 + frontPad) * 86400000);
  const monthCols = [];
  let lastMonth = -1;
  for (let col = 0; col < weeks; col++) {
    const d = new Date(startDate.getTime() + col * 7 * 86400000);
    const m = d.getMonth();
    if (m !== lastMonth) {
      monthCols.push({ col, label: monthNames[m] });
      lastMonth = m;
    }
  }

  const cellSize = 11;
  const cellGap = 3;
  const rows = 7;
  const rowLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14,
      padding: "18px 22px",
      border: "1px solid var(--border-strong)",
      background: "var(--surface-alt)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--text-dim)", letterSpacing: "0.18em", textTransform: "uppercase",
          }}>
            Activity
          </span>
          <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
            <span style={{ color: "var(--text)" }}>{total}</span> commits across <span style={{ color: "var(--text)" }}>{active}</span> days
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
          last {daysCount} days
        </span>
      </div>

      {/* Grid */}
      <div style={{ display: "flex", gap: 6, overflow: "hidden" }}>
        {/* Row labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: cellGap, paddingTop: 14 }}>
          {rowLabels.map((lb, i) => (
            <div key={i} style={{
              height: cellSize,
              fontFamily: "var(--font-mono)", fontSize: 9,
              color: "var(--text-faint)",
              lineHeight: `${cellSize}px`,
              width: 22,
            }}>{lb}</div>
          ))}
        </div>

        {/* Columns + month labels */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Month labels row */}
          <div style={{ position: "relative", height: 12 }}>
            {monthCols.map(m => (
              <span key={m.col} style={{
                position: "absolute",
                left: m.col * (cellSize + cellGap),
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                color: "var(--text-faint)",
                letterSpacing: "0.02em",
              }}>{m.label}</span>
            ))}
          </div>
          {/* Columns */}
          <div style={{ display: "flex", gap: cellGap }}>
            {Array.from({ length: weeks }).map((_, col) => (
              <div key={col} style={{ display: "flex", flexDirection: "column", gap: cellGap }}>
                {Array.from({ length: rows }).map((_, row) => {
                  const c = cells[col * 7 + row];
                  const b = bucket(c);
                  const isToday = col === weeks - 1 && row === todayDow;
                  return (
                    <div key={row} style={{
                      width: cellSize, height: cellSize,
                      background: bucketBg(b),
                      border: b === -1
                        ? "none"
                        : isToday
                          ? "1px solid var(--primary)"
                          : "1px solid rgba(255,255,255,0.02)",
                      boxShadow: b >= 3 ? "0 0 5px rgba(255,43,43,0.35)" : "none",
                      transition: "background 200ms, transform 120ms",
                      cursor: b >= 0 ? "pointer" : "default",
                    }}
                    className={b >= 0 ? "heatmap-cell" : ""}
                    title={b >= 0 ? `${c} commit${c === 1 ? "" : "s"}` : ""} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--text-faint)" }}>
        <span>less</span>
        {[0, 1, 2, 3, 4].map(b => (
          <div key={b} style={{
            width: cellSize, height: cellSize,
            background: bucketBg(b),
            border: "1px solid rgba(255,255,255,0.02)",
            boxShadow: b >= 3 ? "0 0 4px rgba(255,43,43,0.3)" : "none",
          }} />
        ))}
        <span>more</span>
      </div>

      <style>{`
        .heatmap-cell:hover { transform: scale(1.2); outline: 1px solid var(--text-muted); outline-offset: 1px; position: relative; z-index: 2; }
      `}</style>
    </div>
  );
}

window.CoursesCatalog = { EnrolledCard, CatalogCard, TrackRow, ActivityStream, BuildsList, ActivityHeatmap };
