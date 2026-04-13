"use client";

import { useState, useEffect } from "react";
import { fetchResources } from "@/lib/api";
import type { ResourceContent } from "@/lib/types";

export function useResources(courseId: string, lang: string, submoduleId: string | null) {
  const [resources, setResources] = useState<ResourceContent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submoduleId) { setResources([]); return; }
    setLoading(true);
    fetchResources(courseId, lang, submoduleId)
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [courseId, lang, submoduleId]);

  return { resources, loading };
}
