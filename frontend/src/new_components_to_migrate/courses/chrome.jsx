/* Courses dashboard top navigation */

const { useState: uCCState, useRef: uCCRef, useEffect: uCCEff } = React;

function LangBadge({ lang, lang_label, size = "sm" }) {
  // Per-language micro-accent; keeps the brand red for brand moments only.
  const hues = {
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

function TopNav({ query, setQuery, active = "courses" }) {
  const tabs = [
    { id: "courses", label: "Courses", href: "Courses.html" },
    { id: "tracks", label: "Tracks", href: "Tracks.html" },
    { id: "practice", label: "Practice", href: "Practice.html" },
    { id: "builds", label: "Builds", href: "Builds.html" },
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
      <a href="Courses.html" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
        <img src="assets/builderslogo2.svg" alt="" width="24" height="24" style={{ opacity: 0.95 }} />
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
      </a>

      <div style={{ width: 1, height: 18, background: "var(--border-strong)" }} />

      {/* Tabs */}
      <nav style={{ display: "flex", gap: 2 }}>
        {tabs.map(t => (
          <a
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
          </a>
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
        <span style={{ fontSize: 12.5, color: "var(--text)" }}>{window.CoursesData.USER.display}</span>
        <Icon.Chevron size={10} style={{ color: "var(--text-dim)", transform: "rotate(90deg)" }} />
      </div>

      <style>{`
        .hover-brighten:hover { background: var(--surface-active) !important; }
      `}</style>
    </header>
  );
}

window.CoursesNav = { TopNav, LangBadge };
