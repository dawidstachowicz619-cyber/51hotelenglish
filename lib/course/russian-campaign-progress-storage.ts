import { appendLearningHistory } from "@/lib/hr/learning-history-storage";
import {
  afterLearningCompletion,
  notifyLearningBlocked,
  precheckLearningCompletion,
} from "@/lib/hr/hr-registration";
import { addPoints, loadProfile } from "@/lib/points/storage";
import { POINTS_RULES } from "@/lib/points/rules";
import type { LearningCompletionResult } from "@/lib/types/learning-gate";
import type {
  RussianCampaignDepartment,
  RussianCampaignProgress,
} from "@/lib/types/hotel-russian-campaign";
import {
  RUSSIAN_CAMPAIGN_PROGRESS_KEY,
  campaignLevelId,
} from "@/lib/types/hotel-russian-campaign";

const EMPTY: RussianCampaignProgress = {
  completedLevelIds: [],
  levelScores: {},
};

type Store = Record<string, Record<RussianCampaignDepartment, RussianCampaignProgress>>;

function loadStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(RUSSIAN_CAMPAIGN_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Store): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUSSIAN_CAMPAIGN_PROGRESS_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("russian-campaign-updated"));
}

function getDeptProgress(
  store: Store,
  userId: string,
  department: RussianCampaignDepartment
): RussianCampaignProgress {
  return store[userId]?.[department] ?? { ...EMPTY };
}

export function loadRussianCampaignProgress(
  department: RussianCampaignDepartment,
  userId?: string
): RussianCampaignProgress {
  const id = userId ?? loadProfile().userId;
  return getDeptProgress(loadStore(), id, department);
}

export function isLevelUnlocked(
  department: RussianCampaignDepartment,
  level: number,
  userId?: string
): boolean {
  if (level <= 1) return true;
  const progress = loadRussianCampaignProgress(department, userId);
  const prevId = campaignLevelId(department, level - 1);
  return progress.completedLevelIds.includes(prevId);
}

export function getLevelStatus(
  department: RussianCampaignDepartment,
  level: number,
  userId?: string
): "locked" | "current" | "completed" {
  const progress = loadRussianCampaignProgress(department, userId);
  const id = campaignLevelId(department, level);
  if (progress.completedLevelIds.includes(id)) return "completed";
  if (isLevelUnlocked(department, level, userId)) return "current";
  return "locked";
}

export function completeRussianCampaignLevel(
  department: RussianCampaignDepartment,
  level: number,
  score: number,
  title: string
): LearningCompletionResult<RussianCampaignProgress> {
  const profile = loadProfile();
  const store = loadStore();
  const current = getDeptProgress(store, profile.userId, department);
  const id = campaignLevelId(department, level);
  const alreadyDone = current.completedLevelIds.includes(id);

  if (!alreadyDone) {
    const block = precheckLearningCompletion();
    if (block) {
      notifyLearningBlocked();
      return { ok: false, block };
    }
  }

  if (!alreadyDone) {
    current.completedLevelIds.push(id);
    addPoints("russian_campaign_level", {
      points: 15,
      label: `${department === "room" ? "客房" : "餐饮"}闯关 · 第 ${level} 关`,
    });
  }

  current.levelScores[id] = Math.max(current.levelScores[id] ?? 0, score);

  if (!store[profile.userId]) {
    store[profile.userId] = {
      room: { ...EMPTY },
      dining: { ...EMPTY },
    };
  }
  store[profile.userId][department] = current;
  saveStore(store);

  if (!alreadyDone) {
    appendLearningHistory({
      employeeId: profile.userId,
      at: new Date().toISOString(),
      phase: "general",
      ask: "skill",
      title: `俄语必修 · ${title}`,
      subtitle: `${department === "room" ? "客房部" : "餐饮部"} · 第 ${level} 关 · ${score}%`,
      score,
    });
    afterLearningCompletion();
  }

  return { ok: true, data: current };
}

export function getDepartmentProgressPercent(
  department: RussianCampaignDepartment,
  totalLevels: number,
  userId?: string
): number {
  const progress = loadRussianCampaignProgress(department, userId);
  return Math.round((progress.completedLevelIds.length / totalLevels) * 100);
}
