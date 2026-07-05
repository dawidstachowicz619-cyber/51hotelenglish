import type { CefrLevel } from "@/lib/types/course";
import { CEFR_LEVELS } from "@/lib/types/course";
import { loadLevelTestProgress } from "@/lib/assessment/level-progress-storage";
import { loadProfile } from "@/lib/points/storage";
import type { CEFRLevel } from "@/lib/types/assessment";

/** 未测评时可试学的级别 */
export const TRIAL_CEFR_LEVEL: CefrLevel = "A1";

export function getLevelIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

/** 将旧版单次测评结果迁移到分级测评存储 */
export function ensureLegacyAssessmentMigrated(): void {
  if (typeof window === "undefined") return;

  const progress = loadLevelTestProgress();
  if (Object.values(progress).some((record) => record?.passed)) return;

  const profile = loadProfile();
  const rawLevel = profile.cefrLevel;
  if (!rawLevel || rawLevel === "—" || !CEFR_LEVELS.includes(rawLevel as CefrLevel)) {
    return;
  }
  const level = rawLevel as CEFRLevel;
  if (profile.assessmentScore <= 0) return;

  try {
    localStorage.setItem(
      "cefr-level-tests",
      JSON.stringify({
        ...progress,
        [level]: {
          passed: profile.assessmentScore >= 60,
          score: profile.assessmentScore,
          correct: 0,
          total: 25,
          date: new Date().toISOString(),
        },
      })
    );
  } catch {
    return;
  }

  window.dispatchEvent(new Event("assessment-updated"));
}

/** 测评通关的最高级别；未通关任何级别时返回 null */
export function getHighestPassedLevel(): CefrLevel | null {
  ensureLegacyAssessmentMigrated();
  const progress = loadLevelTestProgress();
  let highest: CefrLevel | null = null;
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

  return highest;
}

/** 是否可学习 targetLevel（未测评仅可试学 A1；测评后 target ≤ 最高通关级别） */
export function canAccessCourseLevel(
  maxLevel: CefrLevel | null,
  targetLevel: CefrLevel
): boolean {
  if (!maxLevel) {
    return targetLevel === TRIAL_CEFR_LEVEL;
  }
  return getLevelIndex(targetLevel) <= getLevelIndex(maxLevel);
}

export function getAccessibleLevels(maxLevel: CefrLevel | null): CefrLevel[] {
  if (!maxLevel) return [TRIAL_CEFR_LEVEL];
  const maxIdx = getLevelIndex(maxLevel);
  return CEFR_LEVELS.filter((_, i) => i <= maxIdx);
}

export function getDefaultStudyLevel(maxLevel: CefrLevel | null): CefrLevel {
  return maxLevel ?? TRIAL_CEFR_LEVEL;
}

export function isTrialAccess(maxLevel: CefrLevel | null): boolean {
  return maxLevel === null;
}
