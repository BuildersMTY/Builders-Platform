"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { fetchCourse, fetchFiles, fetchProgress } from "@/lib/api";

export function WorkspaceMain() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    course,
    setCourse,
    setFiles,
    setActiveSubmodule,
    setPassedSubmodules,
    activeFile,
    files,
  } = useWorkspace();

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

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-text-muted">Cargando...</span>
      </div>
    );
  }

  const activeContent = files.find((f) => f.filepath === activeFile);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 items-center justify-center bg-bg text-text-dim text-sm">
        {activeFile ? (
          <pre className="max-h-full overflow-auto p-4 font-mono text-xs text-text-muted">
            {activeContent?.content ?? ""}
          </pre>
        ) : (
          "Selecciona un archivo"
        )}
      </div>
    </div>
  );
}
