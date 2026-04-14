"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspace, isResourceTab } from "@/components/workspace/workspace-provider";
import { WorkspaceSkeleton } from "@/components/workspace/workspace-skeleton";
import { Editor } from "@/components/workspace/editor";
import { TabBar } from "@/components/workspace/tab-bar";
import { TaskBrief } from "@/components/workspace/task-brief";
import { TestOutput } from "@/components/workspace/test-output";
import { ResourceTab } from "@/components/workspace/resource-tab";
import { SuccessOverlay } from "@/components/workspace/success-overlay";
import { useAutosave } from "@/hooks/use-autosave";
import { fetchCourse, fetchFiles, fetchProgress } from "@/lib/api";
import { File } from "lucide-react";

export function WorkspaceMain() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    course,
    setCourse,
    files,
    setFiles,
    activeFile,
    activeSubmodule,
    updateFileContent,
    setActiveSubmodule,
    setPassedSubmodules,
    panelOpen,
    setPanelView,
    togglePanel,
    testOutputOpen,
    setTestOutputOpen,
    closeFile,
  } = useWorkspace();

  const isActiveResource = activeFile ? isResourceTab(activeFile) : false;
  const activeContent = isActiveResource
    ? ""
    : files.find((f) => f.filepath === activeFile)?.content ?? "";

  const { saving, saved, forceSave } = useAutosave({
    courseId: params.courseId,
    lang: params.lang,
    filepath: isActiveResource ? null : activeFile,
    content: activeContent,
  });

  useEffect(() => {
    async function load() {
      const [courseData, filesData, progressData] = await Promise.all([
        fetchCourse(params.courseId, params.lang),
        fetchFiles(params.courseId, params.lang),
        fetchProgress(params.courseId, params.lang).catch(() => null),
      ]);

      setCourse(courseData);
      setFiles(filesData);

      if (progressData) {
        setPassedSubmodules(progressData.passed.map((p) => p.submodule_id));
      }

      const passedIds = new Set(progressData?.passed.map((p) => p.submodule_id) ?? []);
      for (const mod of courseData.modules) {
        for (const sub of mod.submodules) {
          if (!passedIds.has(sub.full_id)) {
            setActiveSubmodule(mod, sub);
            return;
          }
        }
      }
      if (courseData.modules[0]?.submodules[0]) {
        setActiveSubmodule(courseData.modules[0], courseData.modules[0].submodules[0]);
      }
    }
    load();
  }, [params.courseId, params.lang, setCourse, setFiles, setActiveSubmodule, setPassedSubmodules]);

  // Listen for run-tests event
  useEffect(() => {
    function handleRunRequest() {
      setTestOutputOpen(true);
    }
    window.addEventListener("buildmancer:run-tests", handleRunRequest);
    return () => window.removeEventListener("buildmancer:run-tests", handleRunRequest);
  }, [setTestOutputOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "Enter") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("buildmancer:run-tests"));
      }
      if (mod && e.key === "s") {
        e.preventDefault();
        forceSave();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (testOutputOpen) {
          setTestOutputOpen(false);
        } else if (panelOpen) {
          setPanelView(null);
        }
        return;
      }
      if (mod && e.key === "1") { e.preventDefault(); togglePanel("modules"); }
      if (mod && e.key === "2") { e.preventDefault(); togglePanel("files"); }
      if (mod && e.key === "3") { e.preventDefault(); togglePanel("resources"); }
      if (mod && e.key === "b") { e.preventDefault(); setPanelView(panelOpen ? null : "modules"); }
      if (mod && e.key === "j") { e.preventDefault(); setTestOutputOpen(!testOutputOpen); }
      if (mod && e.key === "w") { e.preventDefault(); if (activeFile) closeFile(activeFile); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [forceSave, togglePanel, setPanelView, setTestOutputOpen, testOutputOpen, panelOpen, activeFile, closeFile]);

  if (!course) {
    return <WorkspaceSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TaskBrief />
      <TabBar saving={saving} saved={saved} />
      <div className="relative flex flex-1 overflow-hidden">
        <div
          key={activeSubmodule?.full_id ?? "none"}
          className="flex flex-1 flex-col overflow-hidden animate-contentSwap"
        >
          {activeFile ? (
            isActiveResource ? (
              <ResourceTab tabId={activeFile} />
            ) : (
              <div className="flex-1 overflow-hidden">
                <Editor
                  content={activeContent}
                  language={course.meta.language}
                  onChange={(val) => updateFileContent(activeFile, val)}
                />
              </div>
            )
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-xl p-10 text-center max-w-xs">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
                  <File size={20} className="text-text-dim" />
                </div>
                <p className="text-sm font-medium text-text-muted">
                  Selecciona un archivo para editar
                </p>
                <p className="mt-2 text-xs text-text-dim leading-relaxed">
                  Haz click en los archivos del task brief o abre el panel de archivos con <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">Ctrl+2</kbd>
                </p>
              </div>
            </div>
          )}
          {testOutputOpen && <TestOutput />}
        </div>
        <SuccessOverlay />
      </div>
    </div>
  );
}
