"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { go } from "@codemirror/lang-go";
import { python } from "@codemirror/lang-python";
import { bracketMatching } from "@codemirror/language";
import { closeBrackets } from "@codemirror/autocomplete";

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
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#ff0000",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "rgba(255, 0, 0, 0.15)",
      },
    ".cm-gutters": {
      backgroundColor: "#0d0d0d",
      color: "#555555",
      borderRight: "1px solid #1a1a1a",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#1a1a1a",
      color: "#888888",
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

export function Editor({ content, language, onChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
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
        keymap.of([...defaultKeymap, ...historyKeymap]),
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

    return () => {
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
    updateContent(content);
  }, [content, updateContent]);

  return <div ref={containerRef} className="h-full overflow-auto" />;
}
