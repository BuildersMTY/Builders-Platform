"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, placeholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting, foldGutter, foldKeymap } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { go } from "@codemirror/lang-go";
import { python } from "@codemirror/lang-python";
import { bracketMatching } from "@codemirror/language";
import { closeBrackets } from "@codemirror/autocomplete";
import { search, searchKeymap } from "@codemirror/search";

// Buildmancer dark theme — #131111 bg with red accents
const buildmancerTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#131111",
      color: "#e0e0e0",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#ff0000",
      fontFamily: "var(--font-mono)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#ff0000",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "rgba(255, 0, 0, 0.15)",
      },
    ".cm-gutters": {
      backgroundColor: "#0c0a0a",
      color: "#8a8a8a",
      borderRight: "1px solid #2a2727",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#1e1c1c",
      color: "#9a9a9a",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(255, 255, 255, 0.03)",
    },
    ".cm-matchingBracket": {
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      outline: "1px solid rgba(255, 0, 0, 0.4)",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(255, 0, 0, 0.25)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(255, 0, 0, 0.4)",
    },
    ".cm-foldGutter .cm-gutterElement": {
      color: "#8a8a8a",
      cursor: "pointer",
    },
    ".cm-foldGutter .cm-gutterElement:hover": {
      color: "#9a9a9a",
    },
    // Search panel styling
    ".cm-panels": {
      backgroundColor: "#0c0a0a",
      borderBottom: "1px solid #2a2727",
      color: "#e0e0e0",
    },
    ".cm-panels input, .cm-panels button": {
      backgroundColor: "#1e1c1c",
      color: "#e0e0e0",
      border: "1px solid #2a2727",
      borderRadius: "2px",
      fontSize: "12px",
      fontFamily: "var(--font-mono)",
    },
    ".cm-panels button:hover": {
      backgroundColor: "#2a2a2a",
    },
    ".cm-panels label": {
      color: "#9a9a9a",
      fontSize: "12px",
    },
    // Placeholder
    ".cm-placeholder": {
      color: "#4a4a4a",
      fontStyle: "italic",
    },
  },
  { dark: true }
);

// Syntax highlighting with red accents
const buildmancerHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#ff4444" },
  { tag: tags.controlKeyword, color: "#ff4444" },
  { tag: tags.operatorKeyword, color: "#ff4444" },
  { tag: tags.definitionKeyword, color: "#ff4444" },
  { tag: tags.modifier, color: "#ff4444" },
  { tag: tags.function(tags.variableName), color: "#dcdcaa" },
  { tag: tags.function(tags.definition(tags.variableName)), color: "#dcdcaa" },
  { tag: tags.typeName, color: "#4ec9b0" },
  { tag: tags.className, color: "#4ec9b0" },
  { tag: tags.string, color: "#ce9178" },
  { tag: tags.number, color: "#b5cea8" },
  { tag: tags.bool, color: "#569cd6" },
  { tag: tags.variableName, color: "#e0e0e0" },
  { tag: tags.definition(tags.variableName), color: "#e0e0e0" },
  { tag: tags.propertyName, color: "#9cdcfe" },
  { tag: tags.comment, color: "#6a9955", fontStyle: "italic" },
  { tag: tags.lineComment, color: "#6a9955", fontStyle: "italic" },
  { tag: tags.blockComment, color: "#6a9955", fontStyle: "italic" },
  { tag: tags.operator, color: "#d4d4d4" },
  { tag: tags.punctuation, color: "#d4d4d4" },
  { tag: tags.bracket, color: "#d4d4d4" },
  { tag: tags.meta, color: "#c586c0" },
  { tag: tags.null, color: "#569cd6" },
]);

interface EditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
}

function getLanguageExtension(lang: string) {
  switch (lang.toLowerCase()) {
    case "go":
      return go();
    case "python":
      return python();
    default:
      return [];
  }
}

// Per-file state cache for cursor position and scroll
const fileStateCache = new Map<string, { selection: { anchor: number; head: number }; scrollTop: number }>();

export function Editor({ content, language, onChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const contentRef = useRef(content);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        closeBrackets(),
        foldGutter(),
        search(),
        placeholder("// Empieza a implementar aquí..."),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap, ...searchKeymap]),
        getLanguageExtension(language),
        buildmancerTheme,
        syntaxHighlighting(buildmancerHighlight),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    // Restore cached state for this file
    const cached = fileStateCache.get(content.slice(0, 200)); // rough key
    if (cached) {
      try {
        const docLen = view.state.doc.length;
        if (cached.selection.anchor <= docLen && cached.selection.head <= docLen) {
          view.dispatch({
            selection: { anchor: cached.selection.anchor, head: cached.selection.head },
          });
        }
        view.scrollDOM.scrollTop = cached.scrollTop;
      } catch {
        // Cached state doesn't match new content
      }
    }

    return () => {
      // Save state before cleanup
      const doc = view.state.doc.toString();
      const key = doc.slice(0, 200);
      const sel = view.state.selection.main;
      fileStateCache.set(key, {
        selection: { anchor: sel.anchor, head: sel.head },
        scrollTop: view.scrollDOM.scrollTop,
      });
      view.destroy();
      viewRef.current = null;
    };
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateContent = useCallback((newContent: string) => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (currentContent !== newContent) {
      view.dispatch({
        changes: { from: 0, to: currentContent.length, insert: newContent },
      });
    }
  }, []);

  useEffect(() => {
    // Only update if content changed externally (file switch)
    if (content !== contentRef.current) {
      contentRef.current = content;
      updateContent(content);
    }
  }, [content, updateContent]);

  return <div ref={containerRef} className="h-full overflow-auto" />;
}
