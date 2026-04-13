"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { runTests } from "@/lib/api";
import type { TestResult } from "@/lib/types";

export type TestStatus = "idle" | "running" | "done";

interface TestLine {
  index: number;
  passed: boolean | null;
  message: string;
}

interface UseTestRunnerReturn {
  status: TestStatus;
  lines: TestLine[];
  allPassed: boolean | null;
  run: () => Promise<void>;
}

export function useTestRunner(
  courseId: string,
  lang: string,
  submoduleId: string | null
): UseTestRunnerReturn {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [lines, setLines] = useState<TestLine[]>([]);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => { eventSourceRef.current?.close(); };
  }, []);

  const run = useCallback(async () => {
    if (!submoduleId) return;
    eventSourceRef.current?.close();
    setStatus("running");
    setLines([]);
    setAllPassed(null);

    try {
      const { run_id } = await runTests(courseId, lang, submoduleId);
      const es = new EventSource(`/api/stream/${run_id}`);
      eventSourceRef.current = es;

      es.addEventListener("run_complete", (event) => {
        const data = JSON.parse(event.data) as { all_passed: boolean; results: TestResult[] };
        setLines(data.results.map((r) => ({ index: r.test_index, passed: r.passed, message: r.message })));
        setAllPassed(data.all_passed);
        setStatus("done");
        es.close();
      });

      es.addEventListener("system_error", (event) => {
        const data = JSON.parse(event.data);
        setLines([{ index: 0, passed: false, message: data.error ?? "Error del sistema" }]);
        setAllPassed(false);
        setStatus("done");
        es.close();
      });

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.line) {
            setLines((prev) => [...prev, { index: prev.length, passed: null, message: data.line }]);
          }
        } catch { /* Not JSON — ignore */ }
      };

      es.onerror = () => { setStatus("done"); es.close(); };
    } catch {
      setLines([{ index: 0, passed: false, message: "Error al iniciar las pruebas" }]);
      setAllPassed(false);
      setStatus("done");
    }
  }, [courseId, lang, submoduleId]);

  return { status, lines, allPassed, run };
}
