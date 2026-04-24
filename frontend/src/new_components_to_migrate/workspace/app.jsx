/* Workspace app — composition root */
const { useState: uAState, useEffect: uAEff, useMemo: uAMemo, useRef: uARef, useCallback: uACb } = React;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "accentHue": 0,
  "density": "comfortable",
  "showMinimap": true,
  "briefTone": "editorial",
  "testsState": "failures",
  "showOverlay": false
}/*EDITMODE-END*/;

function WorkspaceApp() {
  const tweaks = window.useTweaks ? window.useTweaks(DEFAULT_TWEAKS) : [DEFAULT_TWEAKS, () => {}];
  const [tw, setTw] = tweaks;

  // Apply accent hue
  uAEff(() => {
    const hue = tw.accentHue || 0;
    document.documentElement.style.setProperty("--primary", `hsl(${hue}, 90%, 58%)`);
    document.documentElement.style.setProperty("--primary-hover", `hsl(${hue}, 90%, 65%)`);
    document.documentElement.style.setProperty("--primary-dim", `hsla(${hue}, 90%, 58%, 0.14)`);
    document.documentElement.style.setProperty("--primary-glow", `hsla(${hue}, 90%, 58%, 0.35)`);
  }, [tw.accentHue]);

  const course = COURSE;
  const allSubs = course.modules.flatMap(m => m.submodules.map(s => ({ module: m, sub: s })));
  const initialActive = allSubs.find(x => x.sub.active) || allSubs[4];

  const [activePair, setActivePair] = uAState(initialActive);
  const activeSub = activePair.sub;
  const activeModule = activePair.module;

  const [panelView, setPanelView] = uAState("modules");
  const [openTabs, setOpenTabs] = uAState([
    { id: "http/response.go", type: "file", modified: true },
    { id: "http/status.go", type: "file" },
  ]);
  const [activeFile, setActiveFile] = uAState("http/response.go");
  const [paletteOpen, setPaletteOpen] = uAState(false);
  const [testHeight, setTestHeight] = uAState(280);
  const [testsOpen, setTestsOpen] = uAState(true);
  const [toasts, setToasts] = uAState([]);
  const [runHistory, setRunHistory] = uAState({ total: 1, failed: 1 });
  const [overlayOpen, setOverlayOpen] = uAState(false);
  const [savingFlash, setSavingFlash] = uAState({ saving: false, saved: true });
  const [graphOpen, setGraphOpen] = uAState(false);
  const [focusMode, setFocusMode] = uAState(false);

  const pushToast = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(x => [...x, { id, ...t }]);
    setTimeout(() => setToasts(x => x.filter(y => y.id !== id)), 4200);
  };

  // Test runner state
  const [testState, setTestState] = uAState(() => buildTestState(tw.testsState, activeSub.tests));

  uAEff(() => {
    setTestState(buildTestState(tw.testsState, activeSub.tests));
  }, [tw.testsState, activeSub]);

  uAEff(() => {
    setOverlayOpen(!!tw.showOverlay);
  }, [tw.showOverlay]);

  const openFile = (path) => {
    setOpenTabs(tabs => tabs.find(t => t.id === path) ? tabs : [...tabs, { id: path, type: "file" }]);
    setActiveFile(path);
  };

  const openResource = (r) => {
    const id = `resource:${r.id}`;
    setOpenTabs(tabs => tabs.find(t => t.id === id) ? tabs : [...tabs, { id, type: "resource", label: r.title, resource: r }]);
    setActiveFile(id);
    pushToast({ kind: "info", title: "Opened resource", body: r.title });
  };

  const closeTab = (id) => {
    setOpenTabs(tabs => {
      const idx = tabs.findIndex(t => t.id === id);
      const next = tabs.filter(t => t.id !== id);
      if (activeFile === id) {
        setActiveFile(next[Math.max(0, idx - 1)]?.id || null);
      }
      return next;
    });
  };

  const runTests = () => {
    setTestsOpen(true);
    setTestState({ phase: "building", results: [], buildLine: "go build ./...", buildMs: 0, testMs: 0, totalMs: 0 });
    setTimeout(() => {
      setTestState(s => ({ ...s, phase: "running", buildMs: 324 }));
      const tests = activeSub.tests;
      tests.forEach((t, i) => {
        setTimeout(() => {
          setTestState(s => ({
            ...s,
            results: [
              ...s.results.filter(r => r.id !== t.id),
              { id: t.id, status: "running" },
            ],
          }));
        }, i * 220);
        setTimeout(() => {
          setTestState(s => ({
            ...s,
            results: [
              ...s.results.filter(r => r.id !== t.id),
              { id: t.id, status: t.status === "pending" ? "pass" : t.status, dur: t.dur || (12 + Math.floor(Math.random() * 20)) },
            ],
          }));
        }, i * 220 + 180);
      });
      setTimeout(() => {
        setTestState(s => {
          const failed = s.results.some(r => r.status === "fail");
          const total = s.results.reduce((acc, r) => acc + (r.dur || 0), 0);
          return { ...s, phase: "done", testMs: total + 40, totalMs: total + 40 + s.buildMs };
        });
        setRunHistory(h => ({ total: h.total + 1, failed: h.failed + (tests.some(t => t.status === "fail") ? 1 : 0) }));
      }, tests.length * 220 + 260);
    }, 500);
  };

  const markPassed = () => {
    // Simulate: make all tests pass, show overlay
    const tests = activeSub.tests;
    setTestState({
      phase: "done",
      buildMs: 312, testMs: 97, totalMs: 409,
      results: tests.map(t => ({ id: t.id, status: "pass", dur: t.dur || 14 })),
    });
    setTimeout(() => setOverlayOpen(true), 500);
  };

  // Keyboard
  uAEff(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "k") { e.preventDefault(); setPaletteOpen(v => !v); }
      if (mod && e.key === "Enter") { e.preventDefault(); runTests(); }
      if (mod && e.key === "j") { e.preventDefault(); setTestsOpen(v => !v); }
      if (mod && e.key === "b") { e.preventDefault(); setPanelView(v => v ? null : "modules"); }
      if (mod && e.key === "g") { e.preventDefault(); setGraphOpen(v => !v); }
      if (mod && e.key === ".") { e.preventDefault(); setFocusMode(v => !v); }
      if (e.key === "Escape") { setPaletteOpen(false); setOverlayOpen(false); setGraphOpen(false); setFocusMode(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Passed count
  const totalSubs = course.modules.reduce((a, m) => a + m.submodules.length, 0);
  const passedSubs = course.modules.reduce((a, m) => a + m.submodules.filter(s => s.passed).length, 0);

  const activeTab = openTabs.find(t => t.id === activeFile);
  const briefContent = activeSub;

  return (
    <div
      className={focusMode ? "focus-mode" : ""}
      style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      background: "var(--bg)",
    }}>
      <ContextBar
        course={course}
        activeModule={activeModule}
        activeSub={activeSub}
        passedCount={passedSubs}
        totalCount={totalSubs}
        onOpenPalette={() => setPaletteOpen(true)}
        streak={passedSubs}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <div style={{ display: "flex", flexShrink: 0 }} className="rail-and-sidebar">
          <IconRail
            panelView={panelView}
            setPanelView={setPanelView}
            onRun={runTests}
            neverRun={false}
            onOpenGraph={() => setGraphOpen(true)}
          />

          <SidebarShell
            view={panelView}
            course={course}
            activeSub={activeSub}
            setActiveSub={(sub) => {
              const pair = allSubs.find(x => x.sub.full_id === sub.full_id);
              if (pair) setActivePair(pair);
            }}
            files={FILES}
            openFile={openFile}
            activeFile={activeFile}
            resources={activeSub.resources}
            openResource={openResource}
            runHistory={runHistory}
            meta={
              panelView === "modules" ? `${passedSubs}/${totalSubs}`
              : panelView === "files" ? `${FILES.length} files`
              : `${(activeSub.resources || []).length}`
            }
          />
        </div>

        {/* Main editor area */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          minWidth: 0, overflow: "hidden",
          position: "relative",
        }}>
          <TaskBrief sub={briefContent} onOpenFile={openFile} />
          <TabBar
            openTabs={openTabs}
            activeFile={activeFile}
            onActivate={setActiveFile}
            onClose={closeTab}
            saving={savingFlash.saving}
            saved={savingFlash.saved}
          />

          <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
            {activeTab?.type === "resource" ? (
              <ResourceView resource={activeTab.resource} />
            ) : activeTab ? (
              <Editor content={RESPONSE_GO} activeLine={41} highlightLines={[59, 60, 61, 62, 63]} />
            ) : (
              <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-dim)" }}>
                <p>No file open</p>
              </div>
            )}
          </div>

          {testsOpen && (
            <div className="test-panel-wrap">
              <TestPanel
                sub={activeSub}
                state={testState}
                onRun={runTests}
                onClose={() => setTestsOpen(false)}
                onContinue={markPassed}
                height={testHeight}
                setHeight={setTestHeight}
              />
            </div>
          )}

          {overlayOpen && (
            <SuccessOverlay
              sub={activeSub}
              onContinue={() => setOverlayOpen(false)}
              onDismiss={() => setOverlayOpen(false)}
            />
          )}
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onJump={(item) => {
          if (item.kind === "file") openFile(item.label);
          if (item.kind === "action" && item.label === "Run tests") runTests();
          if (item.kind === "action" && item.label === "Toggle test panel") setTestsOpen(v => !v);
          if (item.kind === "action" && item.label === "Toggle focus mode") setFocusMode(v => !v);
          if (item.kind === "action" && item.label === "Open concept map") setGraphOpen(true);
        }}
      />
      <Toasts toasts={toasts} />

      {window.FocusModeOverlay && (
        <window.FocusModeOverlay active={focusMode} onExit={() => setFocusMode(false)} />
      )}

      {window.ConceptGraph && (
        <window.ConceptGraph
          open={graphOpen}
          onClose={() => setGraphOpen(false)}
          onJump={(moduleFullId) => {
            setGraphOpen(false);
            const pair = allSubs.find(x => x.sub.full_id === moduleFullId);
            if (pair) setActivePair(pair);
          }}
        />
      )}

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Accent">
            <window.TweakSlider label="Hue" value={tw.accentHue} min={-10} max={360} step={1} unit="°"
              onChange={(v) => setTw("accentHue", v)} />
          </window.TweakSection>
          <window.TweakSection label="Task brief">
            <window.TweakRadio label="Tone" value={tw.briefTone}
              options={[
                { value: "editorial", label: "Editorial" },
                { value: "terse", label: "Terse" },
              ]}
              onChange={(v) => setTw("briefTone", v)} />
          </window.TweakSection>
          <window.TweakSection label="Test panel state">
            <window.TweakRadio label="Show" value={tw.testsState}
              options={[
                { value: "idle", label: "Idle" },
                { value: "running", label: "Run" },
                { value: "failures", label: "Fail" },
                { value: "pass", label: "Pass" },
              ]}
              onChange={(v) => setTw("testsState", v)} />
          </window.TweakSection>
          <window.TweakSection label="Overlays">
            <window.TweakToggle label="Success overlay" value={tw.showOverlay}
              onChange={(v) => setTw("showOverlay", v)} />
            <window.TweakButton label="Open concept map" onClick={() => setGraphOpen(true)} />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

function buildTestState(mode, tests) {
  if (mode === "idle") return { phase: "idle", results: [], buildMs: 0, testMs: 0, totalMs: 0 };
  if (mode === "running") {
    return {
      phase: "running",
      buildMs: 320,
      testMs: 0,
      totalMs: 0,
      results: [
        { id: tests[0].id, status: "pass", dur: 12 },
        { id: tests[1].id, status: "pass", dur: 8 },
        { id: tests[2].id, status: "running" },
      ],
    };
  }
  if (mode === "pass") {
    return {
      phase: "done",
      buildMs: 312,
      testMs: 88,
      totalMs: 400,
      results: tests.map(t => ({ id: t.id, status: "pass", dur: t.dur || 12 })),
    };
  }
  // failures (default)
  return {
    phase: "done",
    buildMs: 324,
    testMs: 107,
    totalMs: 431,
    results: tests.map(t => ({
      id: t.id,
      status: t.status === "pending" ? "pass" : t.status,
      dur: t.dur || 12,
    })),
  };
}

// Mount
ReactDOM.createRoot(document.getElementById("root")).render(<WorkspaceApp />);
