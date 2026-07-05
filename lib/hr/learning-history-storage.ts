import type {
  LearningHistoryEntry,
  LearningPhase,
} from "@/lib/types/learning-record";
import { LEARNING_HISTORY_KEY } from "@/lib/types/learning-record";
import type { AskDimension } from "@/lib/types/learning-record";

type HistoryStore = Record<string, LearningHistoryEntry[]>;

function loadStore(): HistoryStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LEARNING_HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as HistoryStore;
  } catch {
    return {};
  }
}

function saveStore(store: HistoryStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEARNING_HISTORY_KEY, JSON.stringify(store));
}

export function appendLearningHistory(entry: Omit<LearningHistoryEntry, "id">): void {
  const store = loadStore();
  const list = store[entry.employeeId] ?? [];
  const id = `${entry.employeeId}-${entry.at}-${entry.title}`;
  if (list.some((e) => e.id === id)) return;
  store[entry.employeeId] = [{ ...entry, id }, ...list].slice(0, 500);
  saveStore(store);
}

export function getLearningHistory(employeeId: string): LearningHistoryEntry[] {
  return loadStore()[employeeId] ?? [];
}

export function logNodeCompletion(
  employeeId: string,
  params: {
    phase: LearningPhase;
    ask: AskDimension;
    title: string;
    subtitle?: string;
    nodeId: string;
  }
): void {
  appendLearningHistory({
    employeeId,
    at: new Date().toISOString(),
    phase: params.phase,
    ask: params.ask,
    title: params.title,
    subtitle: params.subtitle,
    nodeId: params.nodeId,
  });
}

export function logAssessmentCompletion(
  employeeId: string,
  level: string,
  score: number
): void {
  appendLearningHistory({
    employeeId,
    at: new Date().toISOString(),
    phase: "onboarding",
    ask: "skill",
    title: `CEFR ${level} 水平测评`,
    subtitle: `得分 ${score}%`,
    score,
  });
}
