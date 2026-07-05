"use client";

import { useCallback, useEffect, useState } from "react";

import {
  canAccessCourseLevel,
  getAccessibleLevels,
  getDefaultStudyLevel,
  getHighestPassedLevel,
  isTrialAccess,
} from "@/lib/assessment/course-access";
import type { CefrLevel } from "@/lib/types/course";

export function useAssessmentAccess() {
  const [maxLevel, setMaxLevel] = useState<CefrLevel | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setMaxLevel(getHighestPassedLevel());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();

    const onUpdate = () => refresh();
    window.addEventListener("assessment-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("assessment-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const accessibleLevels = getAccessibleLevels(maxLevel);
  const hasAssessment = maxLevel !== null;
  const isTrialMode = isTrialAccess(maxLevel);

  return {
    ready,
    maxLevel,
    hasAssessment,
    isTrialMode,
    accessibleLevels,
    canAccess: (level: CefrLevel) => canAccessCourseLevel(maxLevel, level),
    defaultStudyLevel: getDefaultStudyLevel(maxLevel),
  };
}
