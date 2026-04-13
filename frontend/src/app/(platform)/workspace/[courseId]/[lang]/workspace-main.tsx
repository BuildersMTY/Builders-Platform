"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Editor } from "@/components/workspace/editor";
import { TabBar } from "@/components/workspace/tab-bar";
import { TestOutput } from "@/components/workspace/test-output";
import { useAutosave } from "@/hooks/use-autosave";
import { fetchCourse, fetchFiles, fetchProgress } from "@/lib/api";
import { ResourceReader } from "@/components/workspace/resource-reader";

export function WorkspaceMain() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    course,
    setCourse,
    files,
    setFiles,
    activeFile,
    updateFileContent,
    setActiveSubmodule,
    setPassedSubmodules,
    testOutputOpen,
    setTestOutputOpen,
    resourceReaderOpen,
    resourceReaderMode,
  } = useWorkspace();

  const activeContent = files.find((f) => f.filepath === activeFile)?.content ?? "";

  const { saving, saved, forceSave } = useAutosave({
    courseId: params.courseId,
    lang: params.lang,
    filepath: activeFile,
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

  // Listen for run-tests event (from icon rail button) — open the panel
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
        window.dispatchEvent(new CustomEvent("buildmancer:escape"));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [forceSave]);

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-text-muted">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TabBar saving={saving} saved={saved} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {activeFile ? (
            <div className="flex-1 overflow-hidden">
              <Editor
                content={activeContent}
                language={course.meta.language}
                onChange={(val) => updateFileContent(activeFile, val)}
              />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-text-dim">
              Selecciona un archivo para editar
            </div>
          )}
          {testOutputOpen && <TestOutput />}
        </div>
        {resourceReaderOpen && resourceReaderMode === "split" && <ResourceReader />}
      </div>
      {resourceReaderOpen && resourceReaderMode === "slide-over" && <ResourceReader />}
    </div>
  );
}
