import type { RoleplaySession } from "@/lib/types/ai-coach";

const KEY = "51he-ai-coach-sessions";
const COMPLETED_KEY = "51he-ai-coach-completed";

function loadAll(): RoleplaySession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RoleplaySession[]) : [];
  } catch {
    return [];
  }
}

function saveAll(sessions: RoleplaySession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(sessions.slice(0, 20)));
  window.dispatchEvent(new Event("ai-coach-updated"));
}

export function saveRoleplaySession(session: RoleplaySession): void {
  const all = loadAll().filter((s) => s.scenarioId !== session.scenarioId || !s.completed);
  saveAll([session, ...all]);
}

export function getActiveSession(scenarioId: string): RoleplaySession | null {
  return loadAll().find((s) => s.scenarioId === scenarioId && !s.completed) ?? null;
}

export function getCompletedScenarioIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markScenarioCompleted(scenarioId: string): void {
  if (typeof window === "undefined") return;
  const ids = new Set(getCompletedScenarioIds());
  ids.add(scenarioId);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new Event("ai-coach-updated"));
}
