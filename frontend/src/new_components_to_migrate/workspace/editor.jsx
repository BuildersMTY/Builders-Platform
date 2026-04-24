/* TaskBrief + TabBar + Editor surface */
const { useState: useEdState, useEffect: useEdEff, useRef: useEdRef } = React;

function TaskBrief({ sub, onOpenFile }) {
  const [collapsed, setCollapsed] = useEdState(false);
  if (!sub) return null;

  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
      background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 100%)",
      position: "relative",
      flexShrink: 0,
    }}>
      {/* left accent rail */}
      <div style={{
        position: "absolute", left: 0, top: 10, bottom: 10, width: 2,
        background: "var(--primary)",
        boxShadow: "0 0 8px var(--primary-glow)",
      }} />

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex", width: "100%", alignItems: "center", gap: 10,
          padding: "10px 18px 8px 20px",
          background: "transparent", border: "none",
          color: "inherit", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          color: "var(--primary)",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontWeight: 500,
        }}>
          current task
        </span>
        <span style={{ height: 10, width: 1, background: "var(--border-strong)" }} />
        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, letterSpacing: "-0.005em" }}>
          {sub.title}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-faint)",
        }}>
          {collapsed ? "expand" : "collapse"}
        </span>
        <Icon.ChevronDown size={11} style={{
          color: "var(--text-dim)",
          transition: "transform 200ms",
          transform: collapsed ? "rotate(-90deg)" : "none",
        }} />
      </button>

      {!collapsed && (
        <div style={{ padding: "0 24px 14px 20px", animation: "fade-in 180ms ease-out" }}>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            lineHeight: 1.45,
            color: "var(--text)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            maxWidth: 720,
          }}>
            {sub.goal}
          </p>

          <p style={{
            margin: "10px 0 0",
            fontSize: 12.5,
            lineHeight: 1.55,
            color: "var(--text-muted)",
            maxWidth: 780,
          }}>
            {sub.spec}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}>
              files
            </span>
            {sub.stubs.map(s => {
              const name = s.path.split("/").pop();
              return (
                <button
                  key={s.path}
                  onClick={() => onOpenFile(s.path)}
                  className="stub-chip"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "3px 9px 3px 8px",
                    background: "var(--surface)",
                    border: "1px solid var(--border-strong)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}
                >
                  <span style={{
                    width: 4, height: 4, background: extColor(name),
                  }} />
                  {s.path}
                  <span style={{ color: "var(--text-faint)", fontSize: 10 }}>· {s.lines} lines</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <style>{`
        .stub-chip:hover {
          border-color: var(--primary) !important;
          color: var(--text) !important;
          background: var(--surface-hover) !important;
        }
      `}</style>
    </div>
  );
}

function TabBar({ openTabs, activeFile, onActivate, onClose, saving, saved }) {
  if (!openTabs.length) return null;
  return (
    <div style={{
      display: "flex",
      height: 34,
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      overflowX: "auto",
      flexShrink: 0,
    }}>
      {openTabs.map(tab => {
        const isActive = tab.id === activeFile;
        const name = tab.type === "resource" ? tab.label : tab.id.split("/").pop();
        return (
          <div
            key={tab.id}
            onClick={() => onActivate(tab.id)}
            style={{
              position: "relative",
              display: "flex", alignItems: "center", gap: 7,
              padding: "0 12px",
              background: isActive ? "var(--bg)" : "transparent",
              color: isActive ? "var(--text)" : "var(--text-dim)",
              fontFamily: "var(--font-mono)", fontSize: 11,
              cursor: "pointer",
              borderRight: "1px solid var(--border)",
              minWidth: 0,
              userSelect: "none",
              transition: "color 150ms",
            }}
            onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = "var(--text-dim)")}
          >
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1.5,
                background: "var(--primary)",
                boxShadow: "0 0 6px var(--primary-glow)",
              }} />
            )}
            {tab.type === "resource" ? (
              <Icon.Book size={11} style={{ color: "var(--info)" }} />
            ) : (
              <span style={{ width: 5, height: 5, background: extColor(name), flexShrink: 0 }} />
            )}
            <span style={{ whiteSpace: "nowrap" }}>{name}</span>
            {tab.modified && <span style={{
              width: 5, height: 5, borderRadius: "50%", background: "var(--warning)", flexShrink: 0,
            }} />}
            {isActive && saving && !tab.modified && (
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>saving…</span>
            )}
            {isActive && saved && !saving && !tab.modified && (
              <Icon.Check size={10} style={{ color: "var(--success)" }} strokeWidth={2} />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
              style={{
                marginLeft: 3,
                padding: 2,
                background: "transparent", border: "none",
                color: isActive ? "var(--text-muted)" : "var(--text-faint)",
                cursor: "pointer",
                opacity: isActive ? 1 : 0.6,
                display: "grid", placeItems: "center",
              }}
              aria-label={`Close ${name}`}
            >
              <Icon.X size={10} />
            </button>
          </div>
        );
      })}
      <div style={{ flex: 1, background: "var(--surface)" }} />
    </div>
  );
}

/* Basic code renderer — tokenized lines for Go */
function tokenize(line) {
  const KEYWORDS = new Set(["package","import","func","return","if","else","for","range","switch","case","default","struct","interface","type","const","var","go","defer","break","continue","map","chan","select","nil","true","false"]);
  const TYPES = new Set(["int","int64","int32","string","byte","bool","error","uint","float32","float64","rune","any","Response","Headers","Writer","Reader"]);
  // very rough splitter
  const tokens = [];
  let i = 0;
  const push = (t, cls) => tokens.push({ t, cls });
  while (i < line.length) {
    const c = line[i];
    if (c === "/" && line[i + 1] === "/") { push(line.slice(i), "comment"); break; }
    if (c === "\"" || c === "`") {
      let j = i + 1;
      while (j < line.length && line[j] !== c) { if (line[j] === "\\") j++; j++; }
      push(line.slice(i, j + 1), "string"); i = j + 1; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let cls = "ident";
      if (KEYWORDS.has(word)) cls = "kw";
      else if (TYPES.has(word)) cls = "type";
      else if (line[j] === "(") cls = "fn";
      else if (/^[A-Z]/.test(word)) cls = "type";
      push(word, cls); i = j; continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      push(line.slice(i, j), "num"); i = j; continue;
    }
    if (/[{}()\[\]]/.test(c)) { push(c, "brace"); i++; continue; }
    if (/[=+\-*/%<>!&|^~]/.test(c)) { push(c, "op"); i++; continue; }
    push(c, "plain"); i++;
  }
  return tokens;
}

const TOKEN_COLOR = {
  kw: "#ff6b5b",
  type: "#6fd6b8",
  string: "#ffcc88",
  num: "#d69bff",
  comment: "#5a5550",
  fn: "#ffd89b",
  op: "#a6a19a",
  brace: "#8a857e",
  ident: "#e8e4dd",
  plain: "#e8e4dd",
};

function Editor({ content, activeLine, highlightLines = [] }) {
  const lines = content.split("\n");
  return (
    <div style={{
      flex: 1,
      background: "var(--bg)",
      overflow: "auto",
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      lineHeight: "20px",
      position: "relative",
    }}>
      <div style={{ display: "flex", minWidth: "max-content" }}>
        {/* Gutter */}
        <div style={{
          flexShrink: 0,
          padding: "12px 0",
          background: "var(--bg)",
          borderRight: "1px solid var(--border)",
          color: "var(--text-faint)",
          textAlign: "right",
          userSelect: "none",
          position: "sticky", left: 0,
        }}>
          {lines.map((_, i) => {
            const n = i + 1;
            const isHi = highlightLines.includes(n);
            const isActive = activeLine === n;
            return (
              <div key={i} style={{
                padding: "0 12px 0 14px",
                minWidth: 50,
                color: isActive ? "var(--primary)" : isHi ? "var(--warning)" : "var(--text-faint)",
                fontWeight: isActive ? 500 : 400,
                fontVariantNumeric: "tabular-nums",
                fontSize: 11.5,
                height: 20,
                position: "relative",
              }}>
                {isActive && (
                  <span style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                    background: "var(--primary)",
                    boxShadow: "0 0 6px var(--primary-glow)",
                  }} />
                )}
                {n}
              </div>
            );
          })}
        </div>

        {/* Code */}
        <div style={{ padding: "12px 20px 200px 14px", flex: 1 }}>
          {lines.map((line, i) => {
            const tokens = tokenize(line);
            const n = i + 1;
            const isHi = highlightLines.includes(n);
            const isActive = activeLine === n;
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  height: 20,
                  background: isActive
                    ? "rgba(255,43,43,0.06)"
                    : isHi
                      ? "rgba(255,179,71,0.05)"
                      : "transparent",
                  marginLeft: -14, paddingLeft: 14,
                }}
              >
                {tokens.length === 0 ? "\u00A0" : tokens.map((tk, j) => (
                  <span key={j} style={{ color: TOKEN_COLOR[tk.cls] || TOKEN_COLOR.plain }}>
                    {tk.t.replace(/ /g, "\u00A0")}
                  </span>
                ))}
                {isActive && (
                  <span style={{
                    display: "inline-block",
                    width: 2, height: 16,
                    background: "var(--primary)",
                    marginLeft: 1,
                    verticalAlign: "middle",
                    animation: "caret-blink 1s infinite",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimap-like strip */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 58, height: "100%",
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-deep)",
        padding: "12px 10px",
        pointerEvents: "none",
      }}>
        {lines.slice(0, Math.floor((lines.length))).map((line, i) => {
          const len = Math.min(line.length, 42);
          return (
            <div key={i} style={{
              height: 3.5,
              marginBottom: 1,
              width: `${len * 2}%`,
              background: highlightLines.includes(i+1)
                ? "var(--warning)"
                : activeLine === i+1
                  ? "var(--primary)"
                  : line.trim().startsWith("//") ? "var(--text-faint)" : "var(--border-bright)",
              opacity: highlightLines.includes(i+1) ? 0.9 : activeLine === i+1 ? 1 : 0.55,
            }} />
          );
        })}
      </div>
    </div>
  );
}

function ResourceView({ resource }) {
  const BODIES = {
    r1: {
      title: "HTTP/1.1 response format",
      body: [
        { kind: "p", text: "An HTTP/1.1 response is three sections separated by CRLF (\"\\r\\n\"):" },
        { kind: "ol", items: [
          "The status line — protocol, numeric code, and human-readable reason phrase.",
          "Zero or more header fields, each formatted as Key: Value.",
          "A blank line, then the response body (raw bytes).",
        ]},
        { kind: "code", text: "HTTP/1.1 200 OK\\r\\n\nContent-Type: text/plain\\r\\n\nContent-Length: 12\\r\\n\n\\r\\n\nHello world." },
        { kind: "p", text: "Content-Length must be exact — clients use it to know when the body ends. Write it as an ASCII integer, not a binary big-endian value." },
      ],
    },
    r2: {
      title: "bufio.Writer signature",
      body: [
        { kind: "p", text: "Go's buffered writer batches small Write calls into larger ones. You must call Flush() before the connection is closed or the buffered bytes will never reach the wire." },
        { kind: "code", text: "func NewWriter(w io.Writer) *Writer\nfunc (b *Writer) Write(p []byte) (int, error)\nfunc (b *Writer) WriteString(s string) (int, error)\nfunc (b *Writer) Flush() error" },
      ],
    },
    r3: {
      title: "Hint — status line formatting",
      body: [
        { kind: "hint", text: "You already have Response.Status and Response.Reason. The format string you need is exactly: \"HTTP/1.1 %d %s\\r\\n\"." },
        { kind: "p", text: "Common pitfalls:" },
        { kind: "ul", items: [
          "Forgetting the trailing CRLF — clients will hang waiting for the next line.",
          "Using %s for the status code (it will print weird characters).",
          "Writing two spaces between the code and the reason phrase.",
        ]},
      ],
    },
  };
  const meta = BODIES[resource.id] || BODIES.r2;
  return (
    <div style={{
      flex: 1, background: "var(--bg)", overflow: "auto",
      padding: "48px 60px 80px",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: "var(--primary)",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          margin: 0,
        }}>resource · {resource.type}</p>
        <h1 style={{
          margin: "10px 0 28px",
          fontFamily: "var(--font-serif)",
          fontSize: 32,
          fontWeight: 400,
          color: "var(--text)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}>{meta.title}</h1>
        {meta.body.map((b, i) => {
          if (b.kind === "p") return <p key={i} style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--text-muted)", margin: "0 0 16px" }}>{b.text}</p>;
          if (b.kind === "ol") return <ol key={i} style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-muted)", paddingLeft: 22, margin: "0 0 16px" }}>{b.items.map((t, j) => <li key={j}>{t}</li>)}</ol>;
          if (b.kind === "ul") return <ul key={i} style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-muted)", paddingLeft: 22, margin: "0 0 16px" }}>{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>;
          if (b.kind === "code") return (
            <pre key={i} style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--primary)",
              padding: "14px 18px",
              color: "var(--text)",
              overflowX: "auto",
              margin: "0 0 20px",
              lineHeight: 1.6,
            }}>{b.text}</pre>
          );
          if (b.kind === "hint") return (
            <div key={i} style={{
              background: "var(--warning-dim)",
              borderLeft: "2px solid var(--warning)",
              padding: "12px 16px",
              fontSize: 14,
              color: "#ffd89b",
              margin: "0 0 18px",
              lineHeight: 1.55,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <Icon.Hint size={16} style={{ color: "var(--warning)", marginTop: 2, flexShrink: 0 }} />
              <div>{b.text}</div>
            </div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

window.TaskBrief = TaskBrief;
window.TabBar = TabBar;
window.Editor = Editor;
window.ResourceView = ResourceView;
