/* Byte-diff view + Packet flow animation + Concept constellation */
const { useState: uXState, useEffect: uXEff, useRef: uXRef, useMemo: uXMemo } = React;

/* ——————————————————— BYTE DIFF ——————————————————— */
/* Shows the bytes the student's code produced vs what the test expected,
   in a dual hex/ASCII view with differing bytes highlighted. */

function ByteDiff({ expected, actual }) {
  const expBytes = uXMemo(() => stringToBytes(expected), [expected]);
  const actBytes = uXMemo(() => stringToBytes(actual), [actual]);
  const maxLen = Math.max(expBytes.length, actBytes.length);
  const ROW = 16;
  const rows = Math.ceil(maxLen / ROW);

  // Compute diff set
  const diffs = new Set();
  for (let i = 0; i < maxLen; i++) {
    if (expBytes[i] !== actBytes[i]) diffs.add(i);
  }

  const [hoverByte, setHoverByte] = uXState(null);

  return (
    <div style={{
      background: "var(--bg-deep)",
      border: "1px solid var(--border)",
      borderLeft: "2px solid var(--error)",
      margin: "8px 0",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "8px 14px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        fontSize: 10.5,
        color: "var(--text-dim)",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon.Binary size={11} style={{ color: "var(--error)" }} />
          byte diff
        </span>
        <span style={{ color: "var(--text-faint)" }}>·</span>
        <span>{diffs.size} of {maxLen} bytes differ</span>
        <div style={{ flex: 1 }} />
        <span style={{ display: "flex", alignItems: "center", gap: 5, textTransform: "none", letterSpacing: "0.02em" }}>
          <span style={{ width: 8, height: 8, background: "var(--success)", opacity: 0.7 }} /> expected
          <span style={{ width: 8, height: 8, background: "var(--error)", marginLeft: 8, opacity: 0.7 }} /> yours
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "52px 1fr 1fr",
        padding: "6px 14px 4px",
        color: "var(--text-faint)",
        fontSize: 9.5,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        borderBottom: "1px solid var(--border)",
      }}>
        <span>offset</span>
        <span>hex</span>
        <span style={{ paddingLeft: 8, borderLeft: "1px solid var(--border)" }}>ascii</span>
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 220, overflowY: "auto" }}>
        {Array.from({ length: rows }).map((_, r) => {
          const start = r * ROW;
          return (
            <ByteRow
              key={r}
              start={start}
              expBytes={expBytes}
              actBytes={actBytes}
              diffs={diffs}
              hoverByte={hoverByte}
              setHoverByte={setHoverByte}
            />
          );
        })}
      </div>

      {/* Legend/explanation at bottom */}
      {hoverByte != null && (
        <div style={{
          padding: "6px 14px",
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          fontSize: 11,
          color: "var(--text-muted)",
          display: "flex", gap: 16,
        }}>
          <span>byte <b style={{ color: "var(--text)" }}>0x{hoverByte.toString(16).padStart(4, "0")}</b></span>
          <span>expected <b style={{ color: "var(--success)" }}>{formatByte(expBytes[hoverByte])}</b></span>
          <span>got <b style={{ color: "var(--error)" }}>{formatByte(actBytes[hoverByte])}</b></span>
        </div>
      )}
    </div>
  );
}

function ByteRow({ start, expBytes, actBytes, diffs, hoverByte, setHoverByte }) {
  const ROW = 16;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "52px 1fr 1fr",
      padding: "2px 14px",
      lineHeight: "18px",
      borderTop: start > 0 ? "1px solid var(--bg-deep)" : "none",
    }}>
      <span style={{ color: "var(--text-faint)", fontSize: 10.5 }}>
        0x{start.toString(16).padStart(4, "0")}
      </span>
      <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {Array.from({ length: ROW }).map((_, i) => {
          const idx = start + i;
          const b = expBytes[idx];
          const a = actBytes[idx];
          const isDiff = diffs.has(idx);
          const isHover = hoverByte === idx;
          return (
            <span key={i}
              onMouseEnter={() => setHoverByte(idx)}
              onMouseLeave={() => setHoverByte(null)}
              style={{
                display: "inline-block",
                minWidth: 28,
                padding: "0 2px",
                fontSize: 10.5,
                textAlign: "center",
                position: "relative",
                background: isHover
                  ? "var(--surface-hover)"
                  : isDiff ? "var(--error-dim)" : "transparent",
                cursor: "help",
              }}
            >
              <span style={{ color: isDiff ? "var(--success)" : "var(--text-muted)" }}>
                {b != null ? b.toString(16).padStart(2, "0") : "  "}
              </span>
              {isDiff && a != null && (
                <span style={{
                  display: "block",
                  color: "var(--error)",
                  fontSize: 10.5,
                  borderTop: "1px dotted var(--error)",
                  marginTop: 1, paddingTop: 1,
                }}>
                  {a.toString(16).padStart(2, "0")}
                </span>
              )}
            </span>
          );
        })}
      </div>
      <div style={{
        paddingLeft: 8,
        borderLeft: "1px solid var(--border)",
        display: "flex", gap: 0,
        whiteSpace: "pre",
      }}>
        {Array.from({ length: ROW }).map((_, i) => {
          const idx = start + i;
          const b = expBytes[idx];
          const a = actBytes[idx];
          const isDiff = diffs.has(idx);
          return (
            <span key={i}
              onMouseEnter={() => setHoverByte(idx)}
              onMouseLeave={() => setHoverByte(null)}
              style={{
                display: "inline-block",
                width: 14,
                textAlign: "center",
                background: isDiff ? "var(--error-dim)" : "transparent",
                color: isDiff ? "var(--error)" : "var(--text-muted)",
                fontSize: 11,
              }}>
              {printable(b ?? 0) || " "}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function stringToBytes(s) {
  if (!s) return [];
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 256) bytes.push(c);
  }
  return bytes;
}
function printable(b) {
  if (b >= 0x20 && b < 0x7f) return String.fromCharCode(b);
  if (b === 0x0d) return "␍";
  if (b === 0x0a) return "␊";
  return "·";
}
function formatByte(b) {
  if (b == null) return "—";
  return `0x${b.toString(16).padStart(2, "0")} ${printable(b) === "·" ? "" : `(${printable(b)})`}`;
}

/* ——————————————————— PACKET FLOW ——————————————————— */
/* When tests pass, show a visualization of the response being assembled:
   Go code → bufio.Writer → socket → client.  Each phase animates in. */

function PacketFlow({ active }) {
  const [phase, setPhase] = uXState(0);

  uXEff(() => {
    if (!active) { setPhase(0); return; }
    setPhase(0);
    const timers = [];
    [1, 2, 3, 4, 5].forEach((p, i) => {
      timers.push(setTimeout(() => setPhase(p), 350 + i * 420));
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  if (!active) return null;

  return (
    <div style={{
      background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--bg-deep) 100%)",
      border: "1px solid rgba(111,214,184,0.25)",
      borderLeft: "2px solid var(--success)",
      margin: "12px 0 4px",
      padding: "18px 20px 22px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Shimmer band */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(111,214,184,0.6), transparent)",
        animation: "hairline-sweep 2.4s ease-in-out infinite",
      }} />

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--success)", textTransform: "uppercase",
          letterSpacing: "0.2em",
        }}>packet trace</span>
        <span style={{ fontSize: 12.5, color: "var(--text)" }}>
          GET <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>/style.css</span>
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--text-faint)",
        }}>localhost:8080 ← curl/8.4.0</span>
      </div>

      {/* Pipeline */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 40px 1fr 40px 1fr 40px 1fr",
        alignItems: "center",
        gap: 0,
      }}>
        <Node label="Response.Write" sub="your code" active={phase >= 1} done={phase >= 2} icon="code" />
        <Arrow active={phase >= 2} label="status" />
        <Node label="bufio.Writer" sub="4 KB buffer" active={phase >= 2} done={phase >= 4} icon="buffer" />
        <Arrow active={phase >= 4} label="flush" />
        <Node label="TCP socket" sub="*net.Conn" active={phase >= 4} done={phase >= 5} icon="socket" />
        <Arrow active={phase >= 5} label="wire" />
        <Node label="Client" sub="received 200 OK" active={phase >= 5} done={phase >= 5} icon="client" />
      </div>

      {/* Byte stream */}
      <div style={{
        marginTop: 18,
        padding: "10px 14px",
        background: "var(--bg-deep)",
        border: "1px solid var(--border)",
        fontFamily: "var(--font-mono)",
        fontSize: 11.5,
        lineHeight: 1.6,
        position: "relative",
        minHeight: 94,
      }}>
        <StreamLine show={phase >= 1} color="var(--info)" label="HTTP/1.1 200 OK␍␊" desc="status line" />
        <StreamLine show={phase >= 2} color="var(--warning)" label="Content-Type: text/css␍␊" desc="header" />
        <StreamLine show={phase >= 3} color="var(--warning)" label="Content-Length: 218␍␊" desc="header" />
        <StreamLine show={phase >= 3} color="var(--text-dim)" label="␍␊" desc="separator" />
        <StreamLine show={phase >= 4} color="var(--success)" label="body { color: #ff2b2b; }…" desc="body · 218 bytes" />
        {phase >= 5 && (
          <div style={{
            position: "absolute", right: 12, bottom: 8,
            fontSize: 10, color: "var(--success)",
            display: "flex", alignItems: "center", gap: 5,
            animation: "fade-in 300ms ease-out",
          }}>
            <Icon.Check size={10} strokeWidth={3} />
            flushed · 284 bytes · 1.8ms
          </div>
        )}
      </div>
    </div>
  );
}

function Node({ label, sub, active, done, icon }) {
  const Icn = icon === "code" ? Icon.Braces
    : icon === "buffer" ? Icon.Layers
    : icon === "socket" ? Icon.Plug
    : Icon.Globe;
  return (
    <div style={{
      padding: "10px 12px",
      border: active ? "1px solid rgba(111,214,184,0.5)" : "1px solid var(--border)",
      background: active ? "var(--success-dim)" : "var(--surface)",
      position: "relative",
      transition: "all 300ms",
      transform: active ? "translateY(0)" : "translateY(2px)",
      opacity: active ? 1 : 0.5,
    }}>
      {done && (
        <div style={{
          position: "absolute", top: -5, right: -5,
          width: 14, height: 14, borderRadius: "50%",
          background: "var(--success)",
          display: "grid", placeItems: "center",
          animation: "celebrate-in 300ms cubic-bezier(0.16,1,0.3,1)",
        }}>
          <Icon.Check size={8} strokeWidth={3} style={{ color: "#0a1f1a" }} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
        <Icn size={12} style={{ color: active ? "var(--success)" : "var(--text-dim)" }} />
        <span style={{ fontSize: 11.5, color: "var(--text)", fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--text-dim)",
      }}>{sub}</span>
    </div>
  );
}

function Arrow({ active, label }) {
  return (
    <div style={{ position: "relative", height: 40, display: "grid", placeItems: "center" }}>
      <div style={{
        position: "relative",
        height: 1, width: "100%",
        background: active ? "var(--success)" : "var(--border)",
        transition: "background 300ms",
      }}>
        {active && (
          <div style={{
            position: "absolute", top: -2, left: 0,
            width: 12, height: 5,
            background: "linear-gradient(90deg, transparent, var(--success))",
            animation: "packet-slide 1.2s ease-in-out infinite",
          }} />
        )}
        <div style={{
          position: "absolute", right: -5, top: -3,
          width: 0, height: 0,
          borderLeft: `6px solid ${active ? "var(--success)" : "var(--border)"}`,
          borderTop: "3.5px solid transparent",
          borderBottom: "3.5px solid transparent",
        }} />
      </div>
      <span style={{
        position: "absolute", top: 24,
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: active ? "var(--success)" : "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}>{label}</span>
      <style>{`
        @keyframes packet-slide {
          0% { left: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: calc(100% - 12px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function StreamLine({ show, color, label, desc }) {
  if (!show) return (
    <div style={{ height: 20, opacity: 0.2, color: "var(--text-faint)" }}>…</div>
  );
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      animation: "slide-up 300ms cubic-bezier(0.16,1,0.3,1)",
      height: 20,
    }}>
      <span style={{ width: 4, height: 4, background: color, flexShrink: 0 }} />
      <span style={{ color: "var(--text)" }}>{label}</span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{desc}</span>
    </div>
  );
}

/* ——————————————————— CONCEPT CONSTELLATION ——————————————————— */
/* A starfield of concepts. Mastered ones glow; unlocked ones are dim;
   locked ones are barely visible.  Click any node to jump to its lesson. */

const CONCEPTS = [
  { id: "tcp",      name: "TCP listener",     x: 0.14, y: 0.25, mastery: 1,   module: "tcp/listen" },
  { id: "accept",   name: "Accept loop",      x: 0.22, y: 0.54, mastery: 1,   module: "tcp/handle" },
  { id: "goroutine",name: "goroutine",        x: 0.32, y: 0.78, mastery: 0.95,module: "tcp/handle" },
  { id: "request",  name: "Request line",     x: 0.38, y: 0.30, mastery: 1,   module: "http/request" },
  { id: "headers",  name: "Header parsing",   x: 0.46, y: 0.56, mastery: 1,   module: "http/headers" },
  { id: "crlf",     name: "CRLF framing",     x: 0.40, y: 0.74, mastery: 0.9, module: "http/request" },
  { id: "response", name: "Response.Write",   x: 0.60, y: 0.30, mastery: 0.4, module: "http/response", active: true },
  { id: "bufio",    name: "bufio.Writer",     x: 0.66, y: 0.54, mastery: 0.5, module: "http/response" },
  { id: "mime",     name: "MIME types",       x: 0.56, y: 0.72, mastery: 0.2, module: "http/response" },
  { id: "io",       name: "io.Writer",        x: 0.74, y: 0.40, mastery: 0.6, module: "http/response" },
  { id: "mux",      name: "ServeMux",         x: 0.80, y: 0.24, mastery: 0,   module: "router/mux", locked: true },
  { id: "middleware",name:"Middleware",       x: 0.86, y: 0.50, mastery: 0,   module: "router/middleware", locked: true },
  { id: "pool",     name: "Goroutine pool",   x: 0.90, y: 0.75, mastery: 0,   module: "perf/pool", locked: true },
  { id: "ctx",      name: "context.Context",  x: 0.78, y: 0.80, mastery: 0,   module: "perf/timeouts", locked: true },
];

const EDGES = [
  ["tcp", "accept"], ["accept", "goroutine"], ["accept", "request"],
  ["request", "headers"], ["request", "crlf"], ["headers", "crlf"],
  ["headers", "response"], ["response", "bufio"], ["bufio", "io"],
  ["response", "mime"], ["response", "io"],
  ["response", "mux"], ["mux", "middleware"], ["middleware", "pool"], ["pool", "ctx"],
];

function ConceptGraph({ open, onClose, onJump }) {
  const [hover, setHover] = uXState(null);
  const svgRef = uXRef(null);
  const [dims, setDims] = uXState({ w: 900, h: 560 });

  uXEff(() => {
    if (!open) return;
    const el = svgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setDims({ w: r.width, h: r.height });
  }, [open]);

  if (!open) return null;

  const byId = Object.fromEntries(CONCEPTS.map(c => [c.id, c]));
  const toXY = (c) => ({ x: c.x * dims.w, y: c.y * dims.h });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 40,
        background: "radial-gradient(ellipse at center, rgba(10,8,8,0.95) 0%, rgba(5,4,4,0.99) 70%)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 28,
        animation: "fade-in 300ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 1180, height: "100%", maxHeight: 720,
          background: "linear-gradient(180deg, var(--surface) 0%, var(--bg-deep) 100%)",
          border: "1px solid var(--border-strong)",
          position: "relative",
          display: "flex", flexDirection: "column",
          animation: "celebrate-in 350ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "18px 24px",
          borderBottom: "1px solid var(--border)",
        }}>
          <Icon.Constellation size={16} style={{ color: "var(--primary)" }} />
          <div>
            <p style={{
              margin: 0, fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.22em",
            }}>concept map</p>
            <h2 style={{
              margin: "2px 0 0",
              fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400,
              color: "var(--text)", letterSpacing: "-0.02em",
            }}>What you know so far</h2>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <LegendDot color="var(--success)" label="mastered" />
            <LegendDot color="var(--primary)" label="learning" />
            <LegendDot color="var(--text-dim)" label="locked" />
          </div>
          <button onClick={onClose} style={{
            padding: 6, background: "transparent", border: "none",
            color: "var(--text-dim)", cursor: "pointer",
            display: "grid", placeItems: "center",
          }}>
            <Icon.X size={14} />
          </button>
        </div>

        {/* Graph body */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }} ref={svgRef}>
          {/* Ambient starfield */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.15) 50%, transparent 51%), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.12) 50%, transparent 51%), radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.1) 50%, transparent 51%), radial-gradient(1px 1px at 85% 20%, rgba(255,255,255,0.12) 50%, transparent 51%), radial-gradient(1px 1px at 10% 65%, rgba(255,255,255,0.1) 50%, transparent 51%)",
            opacity: 0.5,
          }} />

          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <radialGradient id="glow-success" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(111,214,184,0.5)" />
                <stop offset="100%" stopColor="rgba(111,214,184,0)" />
              </radialGradient>
              <radialGradient id="glow-primary" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,43,43,0.55)" />
                <stop offset="100%" stopColor="rgba(255,43,43,0)" />
              </radialGradient>
              <filter id="soft-blur">
                <feGaussianBlur stdDeviation="0.6" />
              </filter>
            </defs>

            {/* Edges */}
            {EDGES.map(([a, b], i) => {
              const A = byId[a]; const B = byId[b];
              if (!A || !B) return null;
              const p1 = toXY(A); const p2 = toXY(B);
              const bothMastered = A.mastery >= 0.9 && B.mastery >= 0.9;
              const touchesActive = A.active || B.active;
              const locked = A.locked || B.locked;
              const stroke = bothMastered ? "rgba(111,214,184,0.35)"
                : touchesActive ? "rgba(255,43,43,0.45)"
                : locked ? "rgba(74,69,64,0.25)"
                : "rgba(166,161,154,0.18)";
              const isHi = hover && (hover === a || hover === b);
              return (
                <line key={i}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={isHi ? "var(--primary)" : stroke}
                  strokeWidth={isHi ? 1.4 : 0.8}
                  strokeDasharray={locked ? "3 4" : undefined}
                  style={{ transition: "all 180ms" }}
                />
              );
            })}

            {/* Nodes */}
            {CONCEPTS.map(c => {
              const { x, y } = toXY(c);
              const color = c.locked ? "var(--text-faint)"
                : c.active ? "var(--primary)"
                : c.mastery >= 0.9 ? "var(--success)"
                : c.mastery >= 0.4 ? "var(--primary)"
                : "var(--text-dim)";
              const isHi = hover === c.id;
              const radius = c.active ? 8 : c.mastery >= 0.9 ? 6 : c.locked ? 3 : 5;
              const glowColor = c.mastery >= 0.9 ? "url(#glow-success)" : "url(#glow-primary)";
              return (
                <g key={c.id}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => !c.locked && onJump(c.module)}
                  style={{ cursor: c.locked ? "not-allowed" : "pointer" }}
                >
                  {/* Glow halo */}
                  {(c.mastery >= 0.4 || c.active) && !c.locked && (
                    <circle cx={x} cy={y} r={32} fill={glowColor} opacity={isHi ? 0.9 : 0.55}
                      style={{ transition: "opacity 200ms" }} />
                  )}
                  {/* Pulsing ring on active */}
                  {c.active && (
                    <circle cx={x} cy={y} r={14} fill="none"
                      stroke="var(--primary)" strokeWidth={1.2}
                      opacity={0.7}
                      style={{ animation: "constellation-pulse 2.2s ease-out infinite" }}
                    />
                  )}
                  {/* Core */}
                  <circle cx={x} cy={y} r={radius}
                    fill={color}
                    opacity={c.locked ? 0.4 : 1}
                    stroke={isHi ? "var(--text)" : "none"}
                    strokeWidth={isHi ? 1.5 : 0}
                    style={{ transition: "all 180ms" }}
                  />
                  {/* Mastery partial ring */}
                  {c.mastery > 0 && c.mastery < 0.9 && !c.locked && (
                    <circle cx={x} cy={y} r={radius + 4}
                      fill="none"
                      stroke={color} strokeWidth={1.2}
                      strokeDasharray={`${c.mastery * 2 * Math.PI * (radius + 4)} 999`}
                      transform={`rotate(-90 ${x} ${y})`}
                      opacity={0.7}
                    />
                  )}
                  {/* Label */}
                  <text x={x} y={y + radius + 15}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize={c.active || isHi ? 11 : 10}
                    fill={c.locked ? "var(--text-faint)" : isHi ? "var(--text)" : "var(--text-muted)"}
                    opacity={c.locked ? 0.5 : 1}
                    style={{ transition: "all 180ms", userSelect: "none" }}
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <style>{`
            @keyframes constellation-pulse {
              0% { r: 14; opacity: 0.7; }
              100% { r: 30; opacity: 0; }
            }
          `}</style>

          {/* Hover card */}
          {hover && (() => {
            const c = byId[hover];
            if (!c) return null;
            const { x, y } = toXY(c);
            const side = x < dims.w / 2 ? "left" : "right";
            return (
              <div style={{
                position: "absolute",
                left: side === "left" ? x + 24 : undefined,
                right: side === "right" ? dims.w - x + 24 : undefined,
                top: y - 40,
                width: 240,
                padding: "12px 14px",
                background: "var(--surface-alt)",
                border: "1px solid var(--border-strong)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                fontSize: 12,
                pointerEvents: "none",
                animation: "fade-in 150ms ease-out",
              }}>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                  {c.name}
                </p>
                <p style={{ margin: "3px 0 0", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>
                  {c.module}
                </p>
                <div style={{ height: 3, background: "var(--border)", margin: "10px 0 5px", position: "relative" }}>
                  <div style={{
                    position: "absolute", inset: 0, width: `${c.mastery * 100}%`,
                    background: c.locked ? "var(--text-faint)" : c.mastery >= 0.9 ? "var(--success)" : "var(--primary)",
                    boxShadow: c.mastery >= 0.9 ? "0 0 6px rgba(111,214,184,0.6)" : "0 0 6px rgba(255,43,43,0.5)",
                  }} />
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-dim)" }}>
                  {c.locked ? "Locked — complete earlier modules to unlock"
                    : c.mastery >= 0.9 ? `Mastered · ${Math.round(c.mastery * 100)}%`
                    : c.active ? "Currently learning"
                    : `${Math.round(c.mastery * 100)}% mastery`}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 14,
          fontSize: 11.5, color: "var(--text-dim)",
        }}>
          <span>{CONCEPTS.filter(c => c.mastery >= 0.9).length} mastered</span>
          <span style={{ color: "var(--text-faint)" }}>·</span>
          <span>{CONCEPTS.filter(c => c.mastery > 0 && c.mastery < 0.9).length} in progress</span>
          <span style={{ color: "var(--text-faint)" }}>·</span>
          <span>{CONCEPTS.filter(c => c.locked).length} locked</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
            click any concept to jump · esc to close
          </span>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)",
      textTransform: "uppercase", letterSpacing: "0.1em",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color,
        boxShadow: color === "var(--success)" ? "0 0 6px rgba(111,214,184,0.5)" : color === "var(--primary)" ? "0 0 6px rgba(255,43,43,0.5)" : "none" }} />
      {label}
    </span>
  );
}

window.ByteDiff = ByteDiff;
window.PacketFlow = PacketFlow;
window.ConceptGraph = ConceptGraph;
