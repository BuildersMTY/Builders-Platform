"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { saveFile } from "@/lib/api";

interface UseAutosaveOptions {
  courseId: string;
  lang: string;
  filepath: string | null;
  content: string;
  delay?: number;
}

export function useAutosave({ courseId, lang, filepath, content, delay = 1500 }: UseAutosaveOptions) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  const save = useCallback(async () => {
    if (!filepath || content === lastSavedRef.current) return;
    setSaving(true);
    try {
      await saveFile(courseId, lang, filepath, content);
      lastSavedRef.current = content;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Silently fail — will retry on next change
    } finally {
      setSaving(false);
    }
  }, [courseId, lang, filepath, content]);

  useEffect(() => {
    if (!filepath || content === lastSavedRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, delay);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [content, filepath, delay, save]);

  useEffect(() => {
    lastSavedRef.current = content;
  }, [filepath]); // eslint-disable-line react-hooks/exhaustive-deps

  return { saving, saved, forceSave: save };
}
