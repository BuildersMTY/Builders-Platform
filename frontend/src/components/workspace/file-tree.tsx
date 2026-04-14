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
    <div className="p-4">
      <h4 className="text-base tracking-tight">
        <span className="font-serif italic text-primary">Archivos</span>
      </h4>
      <div className="mt-3 flex flex-col gap-0.5" role="tree" aria-label="File tree">
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
    return (
      <button
        onClick={() => onFileClick(node.path)}
        className={`flex items-center gap-1.5 rounded-md py-1.5 text-left text-xs transition-colors ${
          activeFile === node.path
            ? "bg-primary-subtle text-text"
            : isStub
              ? "text-text-muted hover:bg-surface-hover hover:text-text"
              : "text-text-dim hover:bg-surface-hover hover:text-text-muted"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px`, paddingRight: "8px" }}
        role="treeitem"
        aria-selected={activeFile === node.path}
      >
        {/* Stub indicator dot */}
        {isStub && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
        )}
        <File size={13} className="flex-shrink-0" />
        {node.name}
      </button>
    );
  }

  return (
    <div role="group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 rounded-md py-1.5 text-left text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
        style={{ paddingLeft: `${depth * 12 + 8}px`, paddingRight: "8px" }}
        aria-expanded={expanded}
        role="treeitem"
      >
        <ChevronRight
          size={12}
          className={`flex-shrink-0 transition-transform duration-150 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        {expanded ? (
          <FolderOpen size={13} className="flex-shrink-0 text-primary" />
        ) : (
          <Folder size={13} className="flex-shrink-0 text-primary" />
        )}
        {node.name}
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
