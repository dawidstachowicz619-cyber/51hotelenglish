import type { EmployeeTrainingProgress } from "@/lib/types/hr-training";
import { EMPLOYEE_TRAINING_PROGRESS_KEY } from "@/lib/types/hr-training";
import { loadProfile } from "@/lib/points/storage";
import { appendLearningHistory } from "@/lib/hr/learning-history-storage";

const EMPTY: EmployeeTrainingProgress = {
  completedModuleIds: [],
  moduleScores: {},
  completedAt: {},
};

function loadAll(): Record<string, EmployeeTrainingProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(EMPLOYEE_TRAINING_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, EmployeeTrainingProgress>) : {};
  } catch {
    return {};
  }
}

function saveAll(store: Record<string, EmployeeTrainingProgress>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMPLOYEE_TRAINING_PROGRESS_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("employee-training-updated"));
}

export function loadTrainingProgress(userId?: string): EmployeeTrainingProgress {
  const id = userId ?? loadProfile().userId;
  return loadAll()[id] ?? { ...EMPTY };
}

export function completeTrainingModule(
  moduleId: string,
  score: number,
  meta: { title: string; phase: string; ask: string }
): EmployeeTrainingProgress {
  const profile = loadProfile();
  const store = loadAll();
  const current = store[profile.userId] ?? { ...EMPTY };

  if (!current.completedModuleIds.includes(moduleId)) {
    current.completedModuleIds.push(moduleId);
  }
  current.moduleScores[moduleId] = Math.max(current.moduleScores[moduleId] ?? 0, score);
  current.completedAt[moduleId] = new Date().toISOString();

  store[profile.userId] = current;
  saveAll(store);

  appendLearningHistory({
    employeeId: profile.userId,
    at: new Date().toISOString(),
    phase: meta.phase as "onboarding" | "role" | "general",
    ask: meta.ask as "attitude" | "skill" | "knowledge",
    title: meta.title,
    subtitle: `HR 培训课程 · 测验 ${score}%`,
    score,
  });

  return current;
}

export function isModuleCompleted(moduleId: string, userId?: string): boolean {
  return loadTrainingProgress(userId).completedModuleIds.includes(moduleId);
}

export function getModuleScore(moduleId: string, userId?: string): number | null {
  const score = loadTrainingProgress(userId).moduleScores[moduleId];
  return score ?? null;
}
