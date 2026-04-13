"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Course, WorkingFile, Module, Submodule } from "@/lib/types";

export type PanelView = "modules" | "files" | "resources" | null;
export type ResourceReaderMode = "slide-over" | "split";

interface WorkspaceState {
  course: Course | null;
  files: WorkingFile[];
  activeModule: Module | null;
  activeSubmodule: Submodule | null;
  activeFile: string | null;
  openFiles: string[];
  panelView: PanelView;
  panelOpen: boolean;
  testOutputOpen: boolean;
  resourceReaderOpen: boolean;
  resourceReaderMode: ResourceReaderMode;
  activeResource: string | null;
  passedSubmodules: Set<string>;
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
  openResourceReader: (resource: string) => void;
  closeResourceReader: () => void;
  toggleResourceReaderMode: () => void;
  markSubmodulePassed: (submoduleId: string) => void;
  setPassedSubmodules: (ids: string[]) => void;
}

const WorkspaceContext = createContext<
  (WorkspaceState & WorkspaceActions) | null
>(null);

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
    resourceReaderOpen: false,
    resourceReaderMode: "slide-over",
    activeResource: null,
    passedSubmodules: new Set(),
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

  const openResourceReader = useCallback((resource: string) => {
    setState((s) => ({ ...s, resourceReaderOpen: true, activeResource: resource }));
  }, []);

  const closeResourceReader = useCallback(() => {
    setState((s) => ({ ...s, resourceReaderOpen: false, activeResource: null }));
  }, []);

  const toggleResourceReaderMode = useCallback(() => {
    setState((s) => ({
      ...s,
      resourceReaderMode: s.resourceReaderMode === "slide-over" ? "split" : "slide-over",
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

  return (
    <WorkspaceContext.Provider
      value={{
        ...state,
        setCourse, setFiles, setActiveSubmodule, setActiveFile, openFile,
        closeFile, updateFileContent, setPanelView, togglePanel,
        setTestOutputOpen, openResourceReader, closeResourceReader,
        toggleResourceReaderMode, markSubmodulePassed, setPassedSubmodules,
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
