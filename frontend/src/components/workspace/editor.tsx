"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { go } from "@codemirror/lang-go";
import { python } from "@codemirror/lang-python";
import { bracketMatching } from "@codemirror/language";
import { closeBrackets } from "@codemirror/autocomplete";

interface EditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
}

function getLanguageExtension(lang: string) {
  switch (lang.toLowerCase()) {
    case "go": return go();
    case "python": return python();
    default: return [];
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
        oneDark,
        EditorView.theme({
          "&": { backgroundColor: "var(--color-bg)", height: "100%" },
          ".cm-gutters": { backgroundColor: "var(--color-bg)", borderRight: "1px solid var(--color-border)" },
          ".cm-activeLineGutter": { backgroundColor: "var(--color-surface-hover)" },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => { view.destroy(); viewRef.current = null; };
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateContent = useCallback((newContent: string) => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (currentContent !== newContent) {
      view.dispatch({ changes: { from: 0, to: currentContent.length, insert: newContent } });
    }
  }, []);

  useEffect(() => { updateContent(content); }, [content, updateContent]);

  return <div ref={containerRef} className="h-full overflow-auto" />;
}
