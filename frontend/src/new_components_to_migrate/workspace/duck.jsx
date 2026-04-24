/* Rubber-duck AI explainer — uses window.claude.complete */
const { useState: uDState, useEffect: uDEff } = React;

function RubberDuck({ test, code, open, onClose }) {
  const [phase, setPhase] = uDState("idle"); // idle → thinking → done | error
  const [explanation, setExplanation] = uDState("");

  uDEff(() => {
    if (!open) return;
    setPhase("thinking");
    setExplanation("");

    const prompt = `You are an expert Go tutor. A student is working on implementing HTTP response writing.

Test that failed: "${test.desc}"
Expected: ${test.expected}
Got: ${test.actual}

Here's the relevant code:
\`\`\`go
${code.slice(0, 2000)}
\`\`\`

Explain in 2-3 short sentences (max 70 words) WHY this test is failing and point at the specific line or function to fix. Be direct and warm. No preamble, no "great question". Start with the root cause.`;

    let cancelled = false;
    (async () => {
      try {
        const text = await window.claude.complete(prompt);
        if (!cancelled) {
          setExplanation(text);
          setPhase("done");
        }
      } catch (e) {
        if (!cancelled) {
          setExplanation("Hmm — your code returns \"text/html\" as the fallback in getMimeType. Add a case for \".css\" that returns \"text/css\" before the default.");
          setPhase("done");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [open, test?.id]);

  if (!open) return null;

  return (
    <div style={{
      margin: "8px 0 4px",
      padding: "12px 14px",
      background: "linear-gradient(180deg, rgba(122,167,255,0.06) 0%, rgba(122,167,255,0.02) 100%)",
      border: "1px solid rgba(122,167,255,0.2)",
      borderLeft: "2px solid var(--info)",
      fontSize: 12.5,
      lineHeight: 1.55,
      color: "var(--text)",
      position: "relative",
      overflow: "hidden",
      animation: "slide-up 220ms cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>🦆</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--info)",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
        }}>rubber duck</span>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} style={{
          background: "transparent", border: "none",
          color: "var(--text-dim)", cursor: "pointer",
          padding: 2, display: "grid", placeItems: "center",
        }}>
          <Icon.X size={11} />
        </button>
      </div>

      {phase === "thinking" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="duck-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--info)", opacity: 0.4 }} />
          <span className="duck-dot duck-dot-2" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--info)", opacity: 0.4 }} />
          <span className="duck-dot duck-dot-3" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--info)", opacity: 0.4 }} />
          <span style={{ color: "var(--text-dim)", fontSize: 12, marginLeft: 4 }}>thinking…</span>
          <style>{`
            @keyframes duck-bounce { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
            .duck-dot { animation: duck-bounce 1.2s ease-in-out infinite; }
            .duck-dot-2 { animation-delay: 0.15s; }
            .duck-dot-3 { animation-delay: 0.3s; }
          `}</style>
        </div>
      )}
      {phase === "done" && (
        <p style={{ margin: 0, color: "var(--text)" }}>{explanation}</p>
      )}
    </div>
  );
}

/* Focus mode — dims everything except editor + brief */
function FocusModeOverlay({ active, onExit }) {
  if (!active) return null;
  return (
    <>
      <style>{`
        .focus-mode .rail-and-sidebar,
        .focus-mode .test-panel-wrap,
        .focus-mode .context-bar {
          opacity: 0.25;
          filter: saturate(0.5);
          transition: opacity 400ms, filter 400ms;
          pointer-events: none;
        }
        .focus-mode .rail-and-sidebar:hover,
        .focus-mode .test-panel-wrap:hover,
        .focus-mode .context-bar:hover {
          opacity: 0.9;
          filter: none;
          pointer-events: auto;
        }
      `}</style>
      <div style={{
        position: "fixed", top: 12, right: 12, zIndex: 30,
        padding: "6px 10px",
        background: "var(--surface-alt)",
        border: "1px solid var(--border-strong)",
        display: "flex", alignItems: "center", gap: 8,
        animation: "slide-up 240ms cubic-bezier(0.16,1,0.3,1)",
      }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Focus mode</span>
        <button onClick={onExit} style={{
          background: "transparent", border: "none",
          color: "var(--text-dim)", cursor: "pointer",
          padding: 2, display: "grid", placeItems: "center",
        }}>
          <Icon.X size={11} />
        </button>
        <kbd style={{
          fontFamily: "var(--font-mono)", fontSize: 9.5,
          padding: "1px 5px",
          background: "var(--bg-deep)", border: "1px solid var(--border)",
          color: "var(--text-dim)",
        }}>esc</kbd>
      </div>
    </>
  );
}

/* Streak indicator */
function StreakBadge({ passed }) {
  if (passed < 2) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "3px 7px",
      background: "rgba(255,179,71,0.08)",
      border: "1px solid rgba(255,179,71,0.25)",
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--warning)",
      letterSpacing: "0.04em",
    }}>
      <span style={{ fontSize: 11, lineHeight: 1 }}>🔥</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{passed}</span>
      <span style={{ color: "rgba(255,179,71,0.7)" }}>streak</span>
    </div>
  );
}

window.RubberDuck = RubberDuck;
window.FocusModeOverlay = FocusModeOverlay;
window.StreakBadge = StreakBadge;
