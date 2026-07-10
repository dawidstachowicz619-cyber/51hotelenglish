import type { CEFRLevel, LevelTestProgress, LevelTestRecord } from "@/lib/types/assessment";
import type { LearningCompletionResult } from "@/lib/types/learning-gate";
import { updateProfile } from "@/lib/points/storage";
import { getLevelIndex } from "@/lib/assessment/course-access";
import {
  afterLearningCompletion,
  notifyLearningBlocked,
  precheckLearningCompletion,
} from "@/lib/hr/hr-registration";
import { CEFR_LEVELS } from "@/lib/types/course";

const STORAGE_KEY = "cefr-level-tests";

export type { LevelTestRecord, LevelTestProgress };

export function loadLevelTestProgress(): LevelTestProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LevelTestProgress) : {};
  } catch {
    return {};
  }
}

export function saveLevelTestResult(
  level: CEFRLevel,
  record: LevelTestRecord
): LearningCompletionResult<LevelTestProgress> {
  const progress = loadLevelTestProgress();
  const prev = progress[level];
  const isRetake = !!prev;

  if (!isRetake) {
    const block = precheckLearningCompletion();
    if (block) {
      notifyLearningBlocked();
      return { ok: false, block };
    }
  }

  const next: LevelTestProgress = {
    ...progress,
    [level]: !prev || record.score >= (prev.score ?? 0) ? record : prev,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  syncProfileHighestLevel(next);
  notifyAssessmentUpdated();
  if (!isRetake) afterLearningCompletion();
  return { ok: true, data: next };
}

export function getPassedLevelCount(progress: LevelTestProgress): number {
  return Object.values(progress).filter((r) => r?.passed).length;
}

function syncProfileHighestLevel(progress: LevelTestProgress) {
  let highest: CEFRLevel | null = null;
  let highestIdx = -1;
  for (const level of CEFR_LEVELS) {
    const record = progress[level];
    if (record?.passed) {
      const idx = getLevelIndex(level);
      if (idx > highestIdx) {
        highestIdx = idx;
        highest = level;
      }
    }
  }
  if (!highest) return;
  const best = progress[highest];
  updateProfile((p) => ({
    ...p,
    cefrLevel: highest!,
    assessmentScore: best?.score ?? p.assessmentScore,
  }));
}

function notifyAssessmentUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("assessment-updated"));
}
