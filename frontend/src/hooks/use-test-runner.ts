"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { runTests } from "@/lib/api";

export type TestStatus = "idle" | "running" | "done";

export interface TestLine {
  index: number;
  passed: boolean | null; // null = info/pending
  message: string;
  expected?: string;
  actual?: string;
  hint?: string;
  description?: string;
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
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const addLine = useCallback(
    (
      passed: boolean | null,
      message: string,
      extra?: Partial<Pick<TestLine, "expected" | "actual" | "hint" | "description">>
    ) => {
      setLines((prev) => [
        ...prev,
        { index: prev.length, passed, message, ...extra },
      ]);
    },
    []
  );

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

      // Build lifecycle
      es.addEventListener("build_start", () => {
        addLine(null, "Compilando...");
      });

      es.addEventListener("build_done", (event) => {
        try {
          const data = JSON.parse(event.data);
          addLine(data.success ? true : false, data.success ? "Build exitoso" : "Build falló");
        } catch {
          addLine(true, "Build completado");
        }
      });

      es.addEventListener("build_error", (event) => {
        try {
          const data = JSON.parse(event.data);
          addLine(false, data.error ?? data.output ?? "Error de compilación");
        } catch {
          addLine(false, "Error de compilación");
        }
      });

      // Process lifecycle
      es.addEventListener("process_started", () => {
        addLine(null, "Proceso iniciado, ejecutando pruebas...");
      });

      es.addEventListener("process_crashed", (event) => {
        try {
          const data = JSON.parse(event.data);
          addLine(false, data.error ?? "El proceso falló");
        } catch {
          addLine(false, "El proceso falló");
        }
      });

      // Test lifecycle — matches Go runner event names
      es.addEventListener("test_start", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.description) {
            addLine(null, data.description, { description: data.description });
          }
        } catch {
          // test_start without description is fine — skip
        }
      });

      es.addEventListener("test_done", (event) => {
        try {
          const data = JSON.parse(event.data);
          addLine(true, data.description ?? data.message ?? "Test pasó", {
            description: data.description,
          });
        } catch {
          addLine(true, "Test pasó");
        }
      });

      es.addEventListener("test_failed", (event) => {
        try {
          const data = JSON.parse(event.data);
          const message =
            data.description ?? data.error ?? data.message ?? "Test falló";
          addLine(false, message, {
            expected: data.expected != null ? String(data.expected) : undefined,
            actual: data.actual != null ? String(data.actual) : undefined,
            hint: data.hint_on_fail,
            description: data.description,
          });
        } catch {
          addLine(false, "Test falló");
        }
      });

      es.addEventListener("test_timeout", (event) => {
        try {
          const data = JSON.parse(event.data);
          addLine(false, `Test excedió el timeout (${data.timeout}ms)`);
        } catch {
          addLine(false, "Test excedió el timeout");
        }
      });

      // Keep legacy event names for backward compatibility during transition
      es.addEventListener("test_pass", (event) => {
        try {
          const data = JSON.parse(event.data);
          addLine(true, data.message ?? "Test pasó");
        } catch {
          addLine(true, "Test pasó");
        }
      });

      es.addEventListener("test_fail", (event) => {
        try {
          const data = JSON.parse(event.data);
          addLine(false, data.message ?? "Test falló", {
            expected: data.expected != null ? String(data.expected) : undefined,
            actual: data.actual != null ? String(data.actual) : undefined,
          });
        } catch {
          addLine(false, "Test falló");
        }
      });

      // Final summary
      es.addEventListener("run_complete", (event) => {
        try {
          const data = JSON.parse(event.data);
          const passed = data.all_passed ?? false;
          setAllPassed(passed);

          // If results array exists, add individual test results
          if (data.results && Array.isArray(data.results)) {
            const resultLines: TestLine[] = data.results.map(
              (r: { passed: boolean; message: string }, i: number) => ({
                index: i,
                passed: r.passed,
                message: r.message,
              })
            );
            setLines((prev) => {
              const infoLines = prev.filter((l) => l.passed === null);
              return [...infoLines, ...resultLines];
            });
          }

          addLine(
            passed,
            passed ? "Todas las pruebas pasaron" : "Algunas pruebas fallaron"
          );
        } catch {
          // No parseable data
        }
        setStatus("done");
        es.close();
      });

      // System error from Python API
      es.addEventListener("system_error", (event) => {
        try {
          const data = JSON.parse(event.data);
          addLine(false, data.error ?? "Error del sistema");
        } catch {
          addLine(false, "Error del sistema");
        }
        setAllPassed(false);
        setStatus("done");
        es.close();
      });

      // Generic unnamed messages (fallback)
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.line) {
            addLine(null, data.line);
          } else if (data.output) {
            addLine(null, data.output);
          }
        } catch {
          if (event.data.trim()) {
            addLine(null, event.data);
          }
        }
      };

      es.onerror = () => {
        setStatus("done");
        es.close();
      };
    } catch {
      addLine(false, "Error al iniciar las pruebas");
      setAllPassed(false);
      setStatus("done");
    }
  }, [courseId, lang, submoduleId, addLine]);

  return { status, lines, allPassed, run };
}
