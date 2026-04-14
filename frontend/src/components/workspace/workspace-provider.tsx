"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Course, WorkingFile, Module, Submodule } from "@/lib/types";
import type { TestLine } from "@/hooks/use-test-runner";

export type PanelView = "modules" | "files" | "resources" | null;

// Tab ID conventions:
//   file tab:     "server.go"  (plain filepath)
//   resource tab: "resource://tcp/server_doc.md::Title"  (prefix + file + title)
const RESOURCE_PREFIX = "resource://";

export function isResourceTab(id: string) {
  return id.startsWith(RESOURCE_PREFIX);
}

export function parseResourceTab(id: string) {
  const rest = id.slice(RESOURCE_PREFIX.length);
  const sep = rest.lastIndexOf("::");
  if (sep < 0) return { file: rest, title: rest };
  return { file: rest.slice(0, sep), title: rest.slice(sep + 2) };
}

export function makeResourceTabId(file: string, title: string) {
  return `${RESOURCE_PREFIX}${file}::${title}`;
}

interface CachedTestResult {
  lines: TestLine[];
  allPassed: boolean | null;
  timestamp: number;
}

interface RunHistory {
  totalRuns: number;
  failedRuns: number;
}

// Stage defaults per resource type (matches DESIGNREVAMP section 9.2.2)
const STAGE_DEFAULTS: Record<string, number> = {
  doc: 0,
  spec: 0,
  signature: 1,
  hint: 2,
};

export function getResourceStage(type: string, explicitStage?: number): number {
  if (explicitStage != null) return explicitStage;
  return STAGE_DEFAULTS[type] ?? 0;
}

export function isResourceVisible(
  stage: number,
  history: RunHistory | undefined
): boolean {
  if (stage === 0) return true;
  if (!history) return false;
  if (stage === 1) return history.totalRuns >= 1;
  if (stage === 2) return history.failedRuns >= 1;
  if (stage === 3) return history.failedRuns >= 3;
  return true;
}

interface WorkspaceState {
  course: Course | null;
  files: WorkingFile[];
  activeModule: Module | null;
  activeSubmodule: Submodule | null;
  activeFile: string | null;      // filepath or resource://... tab ID
  openFiles: string[];            // mix of filepaths and resource:// IDs
  panelView: PanelView;
  panelOpen: boolean;
  testOutputOpen: boolean;
  testPanelHeight: number;
  passedSubmodules: Set<string>;
  testResultsCache: Map<string, CachedTestResult>;
  showSuccessOverlay: boolean;
  completedSubmoduleId: string | null;
  runHistory: Map<string, RunHistory>;
}

interface WorkspaceActions {
  setCourse: (course: Course) => void;
  setFiles: (files: WorkingFile[]) => void;
  setActiveSubmodule: (module: Module, submodule: Submodule) => void;
  setActiveFile: (filepath: string) => void;
  openFile: (filepath: string) => void;
  closeFile: (filepath: string) => void;
  updateFileContent: (filepath: string, content: string) => void;
  setPanelView: (view: PanelView) => void;
  togglePanel: (view: PanelView) => void;
  setTestOutputOpen: (open: boolean) => void;
  setTestPanelHeight: (height: number) => void;
  openResourceTab: (file: string, title: string) => void;
  markSubmodulePassed: (submoduleId: string) => void;
  setPassedSubmodules: (ids: string[]) => void;
  cacheTestResults: (submoduleId: string, result: CachedTestResult) => void;
  getCachedTestResults: (submoduleId: string) => CachedTestResult | undefined;
  showSuccess: (submoduleId: string) => void;
  dismissSuccess: () => void;
  recordRun: (submoduleId: string, passed: boolean) => void;
  getRunHistory: (submoduleId: string) => RunHistory | undefined;
}

const WorkspaceContext = createContext<
  (WorkspaceState & WorkspaceActions) | null
>(null);

const DEFAULT_TEST_PANEL_HEIGHT = 200;
const MIN_TEST_PANEL_HEIGHT = 120;
const MAX_TEST_PANEL_HEIGHT = 400;

function getInitialTestPanelHeight(): number {
  if (typeof window === "undefined") return DEFAULT_TEST_PANEL_HEIGHT;
  const stored = localStorage.getItem("buildmancer:test-panel-height");
  if (stored) {
    const n = parseInt(stored, 10);
    if (n >= MIN_TEST_PANEL_HEIGHT && n <= MAX_TEST_PANEL_HEIGHT) return n;
  }
  return DEFAULT_TEST_PANEL_HEIGHT;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>({
    course: null,
    files: [],
    activeModule: null,
    activeSubmodule: null,
    activeFile: null,
    openFiles: [],
    panelView: "modules",
    panelOpen: true,
    testOutputOpen: false,
    testPanelHeight: getInitialTestPanelHeight(),
    passedSubmodules: new Set(),
    testResultsCache: new Map(),
    showSuccessOverlay: false,
    completedSubmoduleId: null,
    runHistory: new Map(),
  });

  const setCourse = useCallback((course: Course) => {
    setState((s) => ({ ...s, course }));
  }, []);

  const setFiles = useCallback((files: WorkingFile[]) => {
    const firstFile = files[0]?.filepath ?? null;
    setState((s) => ({
      ...s,
      files,
      activeFile: s.activeFile ?? firstFile,
      openFiles: s.openFiles.length > 0 ? s.openFiles : firstFile ? [firstFile] : [],
    }));
  }, []);

  const setActiveSubmodule = useCallback((module: Module, submodule: Submodule) => {
    setState((s) => ({ ...s, activeModule: module, activeSubmodule: submodule }));
  }, []);

  const setActiveFile = useCallback((filepath: string) => {
    setState((s) => ({
      ...s,
      activeFile: filepath,
      openFiles: s.openFiles.includes(filepath) ? s.openFiles : [...s.openFiles, filepath],
    }));
  }, []);

  const openFile = useCallback((filepath: string) => {
    setState((s) => ({
      ...s,
      activeFile: filepath,
      openFiles: s.openFiles.includes(filepath) ? s.openFiles : [...s.openFiles, filepath],
    }));
  }, []);

  const closeFile = useCallback((filepath: string) => {
    setState((s) => {
      const newOpen = s.openFiles.filter((f) => f !== filepath);
      return {
        ...s,
        openFiles: newOpen,
        activeFile: s.activeFile === filepath ? newOpen[newOpen.length - 1] ?? null : s.activeFile,
      };
    });
  }, []);

  const updateFileContent = useCallback((filepath: string, content: string) => {
    setState((s) => ({
      ...s,
      files: s.files.map((f) => (f.filepath === filepath ? { ...f, content } : f)),
    }));
  }, []);

  const setPanelView = useCallback((view: PanelView) => {
    setState((s) => ({ ...s, panelView: view, panelOpen: view !== null }));
  }, []);

  const togglePanel = useCallback((view: PanelView) => {
    setState((s) => {
      if (s.panelView === view && s.panelOpen) {
        return { ...s, panelOpen: false };
      }
      return { ...s, panelView: view, panelOpen: true };
    });
  }, []);

  const setTestOutputOpen = useCallback((open: boolean) => {
    setState((s) => ({ ...s, testOutputOpen: open }));
  }, []);

  const setTestPanelHeight = useCallback((height: number) => {
    const clamped = Math.max(MIN_TEST_PANEL_HEIGHT, Math.min(MAX_TEST_PANEL_HEIGHT, height));
    localStorage.setItem("buildmancer:test-panel-height", String(clamped));
    setState((s) => ({ ...s, testPanelHeight: clamped }));
  }, []);

  // Phase C: resource tabs replace old resource reader
  const openResourceTab = useCallback((file: string, title: string) => {
    const tabId = makeResourceTabId(file, title);
    setState((s) => ({
      ...s,
      activeFile: tabId,
      openFiles: s.openFiles.includes(tabId) ? s.openFiles : [...s.openFiles, tabId],
    }));
  }, []);

  const markSubmodulePassed = useCallback((submoduleId: string) => {
    setState((s) => ({
      ...s,
      passedSubmodules: new Set([...s.passedSubmodules, submoduleId]),
    }));
  }, []);

  const setPassedSubmodules = useCallback((ids: string[]) => {
    setState((s) => ({ ...s, passedSubmodules: new Set(ids) }));
  }, []);

  const cacheTestResults = useCallback((submoduleId: string, result: CachedTestResult) => {
    setState((s) => {
      const next = new Map(s.testResultsCache);
      next.set(submoduleId, result);
      return { ...s, testResultsCache: next };
    });
  }, []);

  const getCachedTestResults = useCallback((submoduleId: string) => {
    return state.testResultsCache.get(submoduleId);
  }, [state.testResultsCache]);

  const showSuccess = useCallback((submoduleId: string) => {
    setState((s) => ({
      ...s,
      showSuccessOverlay: true,
      completedSubmoduleId: submoduleId,
    }));
  }, []);

  const dismissSuccess = useCallback(() => {
    setState((s) => ({
      ...s,
      showSuccessOverlay: false,
      completedSubmoduleId: null,
    }));
  }, []);

  // Phase C: run history for staged resources
  const recordRun = useCallback((submoduleId: string, passed: boolean) => {
    setState((s) => {
      const next = new Map(s.runHistory);
      const prev = next.get(submoduleId) ?? { totalRuns: 0, failedRuns: 0 };
      next.set(submoduleId, {
        totalRuns: prev.totalRuns + 1,
        failedRuns: prev.failedRuns + (passed ? 0 : 1),
      });
      return { ...s, runHistory: next };
    });
  }, []);

  const getRunHistory = useCallback((submoduleId: string) => {
    return state.runHistory.get(submoduleId);
  }, [state.runHistory]);

  return (
    <WorkspaceContext.Provider
      value={{
        ...state,
        setCourse, setFiles, setActiveSubmodule, setActiveFile, openFile,
        closeFile, updateFileContent, setPanelView, togglePanel,
        setTestOutputOpen, setTestPanelHeight, openResourceTab,
        markSubmodulePassed, setPassedSubmodules,
        cacheTestResults, getCachedTestResults, showSuccess, dismissSuccess,
        recordRun, getRunHistory,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
