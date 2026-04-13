"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { X, PanelRightOpen, PanelRightClose } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkspace } from "./workspace-provider";
import { useResources } from "@/hooks/use-resources";

export function ResourceReader() {
  const params = useParams<{ courseId: string; lang: string }>();
  const {
    activeSubmodule,
    activeResource,
    resourceReaderMode,
    closeResourceReader,
    toggleResourceReaderMode,
  } = useWorkspace();

  const { resources } = useResources(
    params.courseId,
    params.lang,
    activeSubmodule?.full_id ?? null
  );

  const [content, setContent] = useState("");

  useEffect(() => {
    if (!activeResource) return;
    const match = resources.find((r) => r.title === activeResource);
    setContent(match?.content ?? "");
  }, [activeResource, resources]);

  useEffect(() => {
    function handleEscape() { closeResourceReader(); }
    window.addEventListener("buildmancer:escape", handleEscape);
    return () => window.removeEventListener("buildmancer:escape", handleEscape);
  }, [closeResourceReader]);

  const isSlideOver = resourceReaderMode === "slide-over";

  if (isSlideOver) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
        <div className="relative mx-4 h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface">
          <ReaderHeader
            title={activeResource ?? "Recurso"}
            mode={resourceReaderMode}
            onToggleMode={toggleResourceReaderMode}
            onClose={closeResourceReader}
          />
          <ReaderContent content={content} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-[400px] flex-shrink-0 overflow-hidden border-l border-border bg-surface">
      <ReaderHeader
        title={activeResource ?? "Recurso"}
        mode={resourceReaderMode}
        onToggleMode={toggleResourceReaderMode}
        onClose={closeResourceReader}
      />
      <ReaderContent content={content} />
    </div>
  );
}

function ReaderHeader({
  title,
  mode,
  onToggleMode,
  onClose,
}: {
  title: string;
  mode: string;
  onToggleMode: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2">
      <span className="text-xs font-medium text-text-muted truncate">{title}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleMode}
          className="rounded p-1 text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          title={mode === "slide-over" ? "Vista dividida" : "Vista modal"}
        >
          {mode === "slide-over" ? <PanelRightOpen size={14} /> : <PanelRightClose size={14} />}
        </button>
        <button onClick={onClose} className="rounded p-1 text-text-dim hover:text-text hover:bg-surface-hover transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function ReaderContent({ content }: { content: string }) {
  return (
    <div className="overflow-y-auto p-6" style={{ height: "calc(100% - 41px)" }}>
      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-text prose-p:text-text-muted prose-a:text-primary prose-code:text-primary prose-code:bg-surface-hover prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-bg prose-pre:border prose-pre:border-border">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    </div>
  );
}
