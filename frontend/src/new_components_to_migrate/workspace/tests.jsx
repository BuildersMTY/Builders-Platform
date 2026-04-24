/* Test panel — coach, not log */
const { useState: useTState, useEffect: useTEff } = React;

function TestPanel({ sub, state, onRun, onClose, onContinue, height, setHeight }) {
  const tests = sub.tests;
  const passedCount = state.results.filter(r => r.status === "pass").length;
  const failedCount = state.results.filter(r => r.status === "fail").length;
  const total = tests.length;
  const allPassed = state.phase === "done" && failedCount === 0 && passedCount === total;
  const anyFailed = state.phase === "done" && failedCount > 0;

  const [dragging, setDragging] = useTState(false);
  useTEff(() => {
    if (!dragging) return;
    const onMove = (e) => {
      setHeight(h => Math.max(160, Math.min(500, window.innerHeight - e.clientY - 30)));
    };
    const onUp = () => setDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging, setHeight]);

  const header = (() => {
    if (state.phase === "idle") return { tone: "idle", label: "Ready", sub: "Press ⌘↵ to run tests" };
    if (state.phase === "building") return { tone: "running", label: "Building…", sub: state.buildLine || "go build ./..." };
    if (state.phase === "running") return { tone: "running", label: "Running tests", sub: `${passedCount + failedCount} / ${total} complete` };
    if (allPassed) return { tone: "pass", label: "All tests passed", sub: `${total} checks · ${state.totalMs}ms total` };
    if (anyFailed) return { tone: "fail", label: `${failedCount} ${failedCount === 1 ? "failure" : "failures"}`, sub: `${passedCount} of ${total} passed` };
    return { tone: "idle", label: "Tests", sub: "" };
  })();

  return (
    <div style={{
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex", flexDirection: "column",
      height,
      flexShrink: 0,
      position: "relative",
    }}>
      {/* Drag handle */}
      <div
        onMouseDown={() => setDragging(true)}
        style={{
          position: "absolute", top: -3, left: 0, right: 0, height: 6,
          cursor: "row-resize",
          zIndex: 5,
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: "50%", transform: "translateX(-50%)",
          width: 40, height: 2, background: dragging ? "var(--primary)" : "transparent",
          transition: "background 150ms",
        }} />
      </div>

      {/* Header strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        height: 42, padding: "0 16px",
        borderBottom: "1px solid var(--border)",
        background: allPassed
          ? "linear-gradient(90deg, rgba(111,214,184,0.08) 0%, transparent 60%)"
          : anyFailed
            ? "linear-gradient(90deg, rgba(255,107,91,0.08) 0%, transparent 60%)"
            : "var(--surface-alt)",
        flexShrink: 0,
        position: "relative",
      }}>
        {/* Tone dot */}
        <span style={{
          position: "relative",
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
          background: header.tone === "pass" ? "var(--success)"
            : header.tone === "fail" ? "var(--error)"
            : header.tone === "running" ? "var(--warning)"
            : "var(--text-faint)",
          boxShadow: header.tone === "pass" ? "0 0 10px rgba(111,214,184,0.6)"
            : header.tone === "fail" ? "0 0 10px rgba(255,107,91,0.6)" : "none",
        }}>
          {header.tone === "running" && (
            <span style={{
              position: "absolute", inset: -4,
              border: "1px solid var(--warning)",
              borderRadius: "50%",
              animation: "pulse-ring 1.4s ease-out infinite",
            }} />
          )}
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 8,
          }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}>tests</span>
            <span style={{
              fontSize: 13, color: "var(--text)", fontWeight: 500, letterSpacing: "-0.005em",
            }}>{header.label}</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{header.sub}</span>
        </div>

        {/* Center: segmented pass-bar */}
        {total > 0 && (state.phase === "running" || state.phase === "done") && (
          <div style={{ display: "flex", gap: 3, marginLeft: 18 }}>
            {tests.map((t, i) => {
              const r = state.results.find(x => x.id === t.id);
              const s = r?.status || "pending";
              return (
                <div key={t.id} style={{
                  width: 22, height: 5,
                  background: s === "pass" ? "var(--success)"
                    : s === "fail" ? "var(--error)"
                    : s === "running" ? "var(--warning)"
                    : "var(--border-strong)",
                  animation: s === "running" ? "pulse-ring 1.2s ease-in-out infinite" : "none",
                  boxShadow: s === "pass" ? "0 0 4px rgba(111,214,184,0.4)" : s === "fail" ? "0 0 4px rgba(255,107,91,0.4)" : "none",
                }} />
              );
            })}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Re-run button */}
        <button
          onClick={onRun}
          disabled={state.phase === "running" || state.phase === "building"}
          className="btn-ghost"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            background: "var(--surface-hover)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            cursor: state.phase === "running" ? "wait" : "pointer",
            opacity: state.phase === "running" ? 0.5 : 1,
            transition: "all 150ms",
          }}
        >
          <Icon.Play size={10} strokeWidth={2} />
          re-run
          <kbd style={{
            fontSize: 9.5,
            padding: "0 4px",
            borderLeft: "1px solid var(--border-strong)",
            marginLeft: 2,
            paddingLeft: 6,
            color: "var(--text-faint)",
          }}>⌘↵</kbd>
        </button>

        {allPassed && (
          <button
            onClick={onContinue}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "6px 12px",
              background: "linear-gradient(180deg, var(--success) 0%, #4fa693 100%)",
              border: "none",
              color: "#0a1f1a",
              fontFamily: "var(--font-sans)",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "-0.005em",
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(111,214,184,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
              animation: "celebrate-in 300ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Next task
            <Icon.ArrowRight size={12} strokeWidth={2.5} />
          </button>
        )}

        <button onClick={onClose} className="btn-ghost"
          style={{
            padding: 6, background: "transparent", border: "none",
            color: "var(--text-dim)", cursor: "pointer",
            display: "grid", placeItems: "center",
          }}>
          <Icon.X size={13} />
        </button>
      </div>

      {/* Body: test rows */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {state.phase === "idle" && state.results.length === 0 && (
          <div style={{
            padding: "28px 22px",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <Icon.Terminal size={18} style={{ color: "var(--text-faint)", marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text)" }}>
                Waiting to run.
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-dim)", maxWidth: 540, lineHeight: 1.5 }}>
                {total} checks will run against your implementation. You'll get a line-by-line breakdown — expected vs actual, plus a hint when something goes wrong.
              </p>
            </div>
          </div>
        )}

        {state.phase === "building" && (
          <div style={{ padding: "14px 22px", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
              <span style={{
                width: 10, height: 10, border: "1.5px solid var(--warning)",
                borderTopColor: "transparent", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              go build ./...
            </div>
          </div>
        )}

        {state.results.map((r, i) => {
          const test = tests.find(t => t.id === r.id);
          return (
            <TestRow key={r.id} test={test} result={r} index={i} />
          );
        })}

        {state.phase === "done" && (
          <div style={{
            margin: "12px 22px 6px",
            padding: "10px 14px",
            borderTop: "1px dashed var(--border)",
            display: "flex", alignItems: "center", gap: 18,
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--text-dim)",
          }}>
            <span>build {state.buildMs}ms</span>
            <span>tests {state.testMs}ms</span>
            <span style={{ color: "var(--text-faint)" }}>·</span>
            <span>total <span style={{ color: "var(--text-muted)" }}>{state.totalMs}ms</span></span>
            <div style={{ flex: 1 }} />
            {allPassed && (
              <span style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon.Sparkle size={12} /> ready for the next task
              </span>
            )}
          </div>
        )}

        {allPassed && window.PacketFlow && (
          <div style={{ padding: "0 22px 14px" }}>
            <window.PacketFlow active={allPassed} />
          </div>
        )}
      </div>
    </div>
  );
}

function TestRow({ test, result, index }) {
  const [expanded, setExpanded] = useTState(result.status === "fail");
  const [duckOpen, setDuckOpen] = useTState(false);
  const { status } = result;

  const icon = status === "pass" ? <Icon.CheckCircle size={14} style={{ color: "var(--success)" }} strokeWidth={2} />
    : status === "fail" ? <Icon.XCircle size={14} style={{ color: "var(--error)" }} strokeWidth={2} />
    : status === "running" ? <span style={{
        width: 12, height: 12, border: "1.5px solid var(--warning)",
        borderTopColor: "transparent", borderRadius: "50%",
        animation: "spin 0.6s linear infinite", display: "inline-block",
      }} />
    : <Icon.Circle size={13} style={{ color: "var(--text-faint)" }} strokeWidth={1.5} />;

  const hasDetail = status === "fail" && (test?.expected || test?.hint);

  return (
    <div style={{
      animation: `slide-up 250ms cubic-bezier(0.16,1,0.3,1) ${index * 50}ms both`,
    }}>
      <div
        onClick={() => hasDetail && setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "7px 22px",
          cursor: hasDetail ? "pointer" : "default",
          borderLeft: status === "fail" ? "2px solid var(--error)" : "2px solid transparent",
          paddingLeft: 20,
          transition: "background 120ms",
        }}
        onMouseEnter={(e) => hasDetail && (e.currentTarget.style.background = "var(--surface-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 14 }}>{icon}</span>
        <span style={{
          fontSize: 12.5,
          color: status === "fail" ? "#ffb8ad" : status === "pass" ? "var(--text-muted)" : "var(--text-dim)",
          flex: 1,
          letterSpacing: "-0.005em",
        }}>
          {test?.desc || result.id}
        </span>
        {result.dur != null && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--text-faint)", fontVariantNumeric: "tabular-nums",
          }}>{result.dur}ms</span>
        )}
        {hasDetail && (
          <Icon.ChevronDown size={12} style={{
            color: "var(--text-faint)",
            transition: "transform 150ms",
            transform: expanded ? "none" : "rotate(-90deg)",
          }} />
        )}
      </div>

      {hasDetail && expanded && (
        <div style={{ padding: "2px 22px 10px 46px", animation: "fade-in 150ms ease-out" }}>
          {test.expected != null && (
            <div style={{
              background: "var(--error-dim)",
              borderLeft: "1px solid var(--error)",
              padding: "8px 14px",
              fontFamily: "var(--font-mono)", fontSize: 11.5,
              lineHeight: 1.6,
            }}>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "var(--text-dim)", width: 62, textAlign: "right" }}>expected</span>
                <span style={{ color: "var(--success)" }}>{test.expected}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "var(--text-dim)", width: 62, textAlign: "right" }}>actual</span>
                <span style={{ color: "var(--error)" }}>{test.actual}</span>
              </div>
            </div>
          )}
          {test.hint && (
            <div style={{
              marginTop: 8,
              background: "var(--warning-dim)",
              borderLeft: "1px solid var(--warning)",
              padding: "8px 14px",
              fontSize: 12,
              color: "#ffd89b",
              lineHeight: 1.55,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <Icon.Hint size={13} style={{ color: "var(--warning)", marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ color: "var(--warning)", fontWeight: 500 }}>Hint · </span>
                {test.hint}
              </div>
              {!duckOpen && (
                <button
                  onClick={(e) => { e.stopPropagation(); setDuckOpen(true); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "3px 8px",
                    background: "rgba(122,167,255,0.08)",
                    border: "1px solid rgba(122,167,255,0.3)",
                    color: "var(--info)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 11 }}>🦆</span>
                  ask duck
                </button>
              )}
            </div>
          )}
          {window.RubberDuck && (
            <window.RubberDuck
              test={test}
              code={window.RESPONSE_GO || ""}
              open={duckOpen}
              onClose={() => setDuckOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

window.TestPanel = TestPanel;
