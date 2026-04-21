"use client";

import { useState } from "react";
import { File, Folder, FolderOpen, ChevronRight } from "lucide-react";
import { useWorkspace } from "./workspace-provider";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

/** Build a tree structure from flat file paths */
function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filepath of paths) {
    const parts = filepath.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const folderPath = parts.slice(0, i + 1).join("/");

      const existing = current.find((n) => n.name === name);
      if (existing) {
        if (existing.type === "folder" && existing.children) {
          current = existing.children;
        }
      } else {
        const node: TreeNode = isFile
          ? { name, path: filepath, type: "file" }
          : { name, path: folderPath, type: "folder", children: [] };
        current.push(node);
        if (!isFile && node.children) {
          current = node.children;
        }
      }
    }
  }

  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const n of nodes) {
      if (n.children) sortNodes(n.children);
    }
  }
  sortNodes(root);

  return root;
}

export function FileTree() {
  const { files, activeFile, activeSubmodule, openFile } = useWorkspace();

  if (files.length === 0) {
    return (
      <div className="p-4">
        <p className="text-xs text-text-dim">No hay archivos todavía.</p>
      </div>
    );
  }

  // Collect stub paths for the active submodule
  const stubPaths = new Set(
    activeSubmodule?.stubs.map((s) => s.path) ?? []
  );

  const tree = buildTree(files.map((f) => f.filepath));

  return (
    <div className="flex flex-col">
      <div className="flex h-7 items-center justify-between border-b border-border px-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
          files
        </span>
        <span className="font-mono text-[10px] tabular-nums text-text-dim/70">
          {files.length}
        </span>
      </div>
      <div className="flex flex-col py-1" role="tree" aria-label="File tree">
        {tree.map((node) => (
          <TreeNodeView
            key={node.path}
            node={node}
            depth={0}
            activeFile={activeFile}
            stubPaths={stubPaths}
            onFileClick={openFile}
          />
        ))}
      </div>
    </div>
  );
}

function TreeNodeView({
  node,
  depth,
  activeFile,
  stubPaths,
  onFileClick,
}: {
  node: TreeNode;
  depth: number;
  activeFile: string | null;
  stubPaths: Set<string>;
  onFileClick: (filepath: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const isStub = node.type === "file" && stubPaths.has(node.path);

  if (node.type === "file") {
    const isActive = activeFile === node.path;
    return (
      <button
        onClick={() => onFileClick(node.path)}
        className={`group flex items-center gap-1.5 py-0.5 text-left font-mono text-[12px] transition-colors ${
          isActive
            ? "bg-bg text-text"
            : isStub
              ? "text-text-muted hover:bg-surface-hover hover:text-text"
              : "text-text-dim hover:bg-surface-hover hover:text-text-muted"
        }`}
        style={{ paddingLeft: `${depth * 12 + 10}px`, paddingRight: "10px" }}
        role="treeitem"
        aria-selected={isActive}
      >
        <File size={11} strokeWidth={1.5} className="flex-shrink-0 opacity-60" />
        <span className="truncate">{node.name}</span>
        {/* Stub marker — dim dot, promoted on hover to primary ONLY if active */}
        {isStub && (
          <span
            className={`ml-auto h-1 w-1 flex-shrink-0 rounded-full ${
              isActive ? "bg-primary" : "bg-text-dim/60"
            }`}
            aria-label="Stub file"
          />
        )}
      </button>
    );
  }

  return (
    <div role="group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1 py-0.5 text-left font-mono text-[12px] text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
        style={{ paddingLeft: `${depth * 12 + 4}px`, paddingRight: "10px" }}
        aria-expanded={expanded}
        role="treeitem"
      >
        <ChevronRight
          size={11}
          strokeWidth={1.75}
          className={`flex-shrink-0 text-text-dim transition-transform duration-150 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        {expanded ? (
          <FolderOpen size={11} strokeWidth={1.5} className="flex-shrink-0 text-text-dim" />
        ) : (
          <Folder size={11} strokeWidth={1.5} className="flex-shrink-0 text-text-dim" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeView
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              stubPaths={stubPaths}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
