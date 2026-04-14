"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useWorkspace, parseResourceTab } from "./workspace-provider";
import { useResources } from "@/hooks/use-resources";

interface ResourceTabProps {
  tabId: string;
}

export function ResourceTab({ tabId }: ResourceTabProps) {
  const params = useParams<{ courseId: string; lang: string }>();
  const { activeSubmodule } = useWorkspace();
  const { file: resourceFile, title } = parseResourceTab(tabId);

  const { resources } = useResources(
    params.courseId,
    params.lang,
    activeSubmodule?.full_id ?? null
  );

  const [content, setContent] = useState("");

  useEffect(() => {
    // Match by title first
    const matchByTitle = resources.find((r) => r.title === title);
    if (matchByTitle) {
      setContent(matchByTitle.content);
      return;
    }
    // Fallback: match by file path via submodule resource index
    const subRes = activeSubmodule?.resources;
    if (subRes) {
      const idx = subRes.findIndex((r) => r.file === resourceFile);
      if (idx >= 0 && resources[idx]) {
        setContent(resources[idx].content);
      }
    }
  }, [title, resourceFile, resources, activeSubmodule]);

  if (!content) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-text-dim">Cargando recurso...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl">
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-text prose-p:text-text-muted prose-a:text-primary prose-strong:text-text prose-code:text-primary prose-code:bg-surface-hover prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg prose-pre:border prose-pre:border-border">
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {content}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
