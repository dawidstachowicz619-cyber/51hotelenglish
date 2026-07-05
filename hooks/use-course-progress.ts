"use client";

import { useCallback, useEffect, useState } from "react";

import {
  completeNode as completeNodeStorage,
  loadFrontDeskProgress,
} from "@/lib/course/progress-storage";
import type { FrontDeskProgress } from "@/lib/types/course-progress";

export function useCourseProgress() {
  const [progress, setProgress] = useState<FrontDeskProgress>({
    completedNodeIds: [],
  });

  const refresh = useCallback(() => {
    setProgress(loadFrontDeskProgress());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("course-progress-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("course-progress-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const completeNode = useCallback(
    (nodeId: string) => {
      const next = completeNodeStorage(nodeId);
      setProgress(next);
      return next;
    },
    []
  );

  return {
    progress,
    completedNodeIds: progress.completedNodeIds,
    completeNode,
    refresh,
  };
}
