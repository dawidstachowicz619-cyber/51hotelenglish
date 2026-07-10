import { isCloudStorageEnabledClient } from "@/lib/db/config";
import type { LearnerBootstrapPayload, LearnerSyncPayload } from "@/lib/db/mappers";
import { FRONT_DESK_PROGRESS_KEY } from "@/lib/types/course-progress";
import { LEARNING_HISTORY_KEY } from "@/lib/types/learning-record";
import { RUSSIAN_CAMPAIGN_PROGRESS_KEY } from "@/lib/types/hotel-russian-campaign";
import { RUSSIAN_DAILY_CHECKIN_KEY } from "@/lib/types/russian-daily-checkin";
import { EMPLOYEE_TRAINING_PROGRESS_KEY } from "@/lib/types/hr-training";
import { loadProfile } from "@/lib/points/storage";

const TRIAL_KEY = "51he-trial-lessons-used";
const META_KEY = "51he-employee-meta";
const CEFR_KEY = "cefr-level-tests";
const RUSSIAN_ITEMS_KEY = "51he-russian-items-progress";

export function isCloudSyncActive(): boolean {
  return isCloudStorageEnabledClient();
}

export function hydrateLocalFromBootstrap(payload: LearnerBootstrapPayload): void {
  if (typeof window === "undefined") return;

  const { profile, trialLessonsUsed, progress, history } = payload;

  localStorage.setItem("51he-points-profile", JSON.stringify(profile));
  localStorage.setItem(TRIAL_KEY, String(trialLessonsUsed));
  localStorage.setItem(FRONT_DESK_PROGRESS_KEY, JSON.stringify(progress.frontDesk));
  localStorage.setItem(CEFR_KEY, JSON.stringify(progress.cefrTests));
  localStorage.setItem(RUSSIAN_DAILY_CHECKIN_KEY, JSON.stringify(progress.russianDaily));
  localStorage.setItem(RUSSIAN_CAMPAIGN_PROGRESS_KEY, JSON.stringify(progress.russianCampaign));
  localStorage.setItem(RUSSIAN_ITEMS_KEY, JSON.stringify(progress.russianItems));
  localStorage.setItem(EMPLOYEE_TRAINING_PROGRESS_KEY, JSON.stringify(progress.employeeTraining));
  localStorage.setItem(META_KEY, JSON.stringify(progress.employeeMeta));

  if (history.length > 0) {
    const store = { [profile.userId]: history };
    localStorage.setItem(LEARNING_HISTORY_KEY, JSON.stringify(store));
  }

  window.dispatchEvent(new Event("points-updated"));
  window.dispatchEvent(new Event("course-progress-updated"));
  window.dispatchEvent(new Event("assessment-updated"));
  window.dispatchEvent(new Event("trial-lessons-updated"));
  window.dispatchEvent(new Event("hr-registration-updated"));
}

export function collectLocalSyncPayload(): LearnerSyncPayload {
  if (typeof window === "undefined") return {};

  const profile = loadProfile();
  const trialRaw = localStorage.getItem(TRIAL_KEY);
  const trialLessonsUsed = trialRaw ? parseInt(trialRaw, 10) : 0;

  const readJson = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  };

  return {
    profile,
    trialLessonsUsed: Number.isFinite(trialLessonsUsed) ? trialLessonsUsed : 0,
    progress: {
      frontDesk: readJson(FRONT_DESK_PROGRESS_KEY),
      cefrTests: readJson(CEFR_KEY),
      russianDaily: readJson(RUSSIAN_DAILY_CHECKIN_KEY),
      russianCampaign: readJson(RUSSIAN_CAMPAIGN_PROGRESS_KEY),
      russianItems: readJson(RUSSIAN_ITEMS_KEY),
      employeeTraining: readJson(EMPLOYEE_TRAINING_PROGRESS_KEY),
      employeeMeta: readJson(META_KEY),
    },
  };
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleCloudPush(): void {
  if (!isCloudSyncActive()) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushLocalToCloud();
  }, 800);
}

export function hasLocalLearningData(): boolean {
  if (typeof window === "undefined") return false;
  const profile = loadProfile();
  const frontDesk = localStorage.getItem(FRONT_DESK_PROGRESS_KEY);
  return (
    !!profile.nickname?.trim() ||
    profile.totalPoints > 0 ||
    !!frontDesk
  );
}

export async function migrateLocalToCloud(): Promise<boolean> {
  if (!isCloudSyncActive() || !hasLocalLearningData()) return false;
  try {
    const res = await fetch("/api/learner/migrate", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectLocalSyncPayload()),
    });
    if (!res.ok) return false;
    return pullFromCloud();
  } catch {
    return false;
  }
}

export async function pullFromCloud(): Promise<boolean> {
  if (!isCloudSyncActive()) return false;
  try {
    const localBefore = loadProfile();
    const res = await fetch("/api/learner/bootstrap", { credentials: "include" });
    if (!res.ok) return false;
    const data = (await res.json()) as LearnerBootstrapPayload & {
      learnerId: string;
      authLinked?: boolean;
    };

    const cloudEmpty = !data.profile.nickname?.trim() && data.profile.totalPoints === 0;
    const localHasData = !!localBefore.nickname?.trim() || localBefore.totalPoints > 0;

    if (cloudEmpty && localHasData) {
      return migrateLocalToCloud();
    }

    hydrateLocalFromBootstrap(data);
    return true;
  } catch {
    return false;
  }
}

export async function pushLocalToCloud(): Promise<boolean> {
  if (!isCloudSyncActive()) return false;
  try {
    const res = await fetch("/api/learner/sync", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectLocalSyncPayload()),
    });
    return res.ok;
  } catch {
    return false;
  }
}
