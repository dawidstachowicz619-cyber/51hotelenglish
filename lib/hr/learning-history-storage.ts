import type {
  LearningHistoryEntry,
  LearningPhase,
} from "@/lib/types/learning-record";
import { LEARNING_HISTORY_KEY } from "@/lib/types/learning-record";
import type { AskDimension } from "@/lib/types/learning-record";

type HistoryStore = Record<string, LearningHistoryEntry[]>;

const PENDING_HISTORY_KEY = "51he-learning-history-pending";

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

function loadPending(): Omit<LearningHistoryEntry, "id">[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Omit<LearningHistoryEntry, "id">[]) : [];
  } catch {
    return [];
  }
}

function savePending(entries: Omit<LearningHistoryEntry, "id">[]): void {
  if (typeof window === "undefined") return;
  if (entries.length === 0) {
    localStorage.removeItem(PENDING_HISTORY_KEY);
    return;
  }
  localStorage.setItem(PENDING_HISTORY_KEY, JSON.stringify(entries));
}

export function drainPendingLearningHistory(): Omit<LearningHistoryEntry, "id">[] {
  const pending = loadPending();
  savePending([]);
  return pending;
}

export function peekPendingLearningHistory(): Omit<LearningHistoryEntry, "id">[] {
  return loadPending();
}

export function appendLearningHistory(entry: Omit<LearningHistoryEntry, "id">): void {
  const store = loadStore();
  const list = store[entry.employeeId] ?? [];
  const id = `${entry.employeeId}-${entry.at}-${entry.title}`;
  if (list.some((e) => e.id === id)) return;
  store[entry.employeeId] = [{ ...entry, id }, ...list].slice(0, 500);
  saveStore(store);

  const pending = loadPending();
  pending.push(entry);
  savePending(pending.slice(-100));

  window.dispatchEvent(new Event("learning-history-updated"));
}

export function getLearningHistory(employeeId: string): LearningHistoryEntry[] {
  return loadStore()[employeeId] ?? [];
}

export function replaceLearningHistory(
  employeeId: string,
  entries: LearningHistoryEntry[]
): void {
  const store = loadStore();
  store[employeeId] = entries;
  saveStore(store);
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
