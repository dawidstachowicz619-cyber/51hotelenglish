import { appendLearningHistory } from "@/lib/hr/learning-history-storage";
import {
  afterLearningCompletion,
  notifyLearningBlocked,
  precheckLearningCompletion,
} from "@/lib/hr/hr-registration";
import { loadProfile } from "@/lib/points/storage";
import type { LearningCompletionResult } from "@/lib/types/learning-gate";

export type ItemsCourseKind = "room" | "dining";

export type ItemsPracticeSession = {
  at: string;
  score: number;
  correctCount: number;
  totalCount: number;
  mode: string;
  itemIds: string[];
};

export type ItemsCourseProgress = {
  sessions: ItemsPracticeSession[];
  studiedItemIds: string[];
};

type Store = Record<string, Record<ItemsCourseKind, ItemsCourseProgress>>;

const STORAGE_KEY = "51he-russian-items-progress";

const EMPTY: ItemsCourseProgress = { sessions: [], studiedItemIds: [] };

const COURSE_META: Record<
  ItemsCourseKind,
  { title: string; historyTitle: string }
> = {
  room: {
    title: "客房物品俄语 100",
    historyTitle: "客房物品俄语 · 练习",
  },
  dining: {
    title: "餐饮物品俄语 100",
    historyTitle: "餐饮物品俄语 · 练习",
  },
};

function loadStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Store): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("russian-items-progress-updated"));
}

function getProgress(
  store: Store,
  userId: string,
  kind: ItemsCourseKind
): ItemsCourseProgress {
  return store[userId]?.[kind] ?? { ...EMPTY };
}

export function loadRussianItemsProgress(
  kind: ItemsCourseKind,
  userId?: string
): ItemsCourseProgress {
  const id = userId ?? loadProfile().userId;
  return getProgress(loadStore(), id, kind);
}

export function logRussianItemsPracticeSession(
  kind: ItemsCourseKind,
  params: {
    score: number;
    correctCount: number;
    totalCount: number;
    mode: string;
    itemIds: string[];
  }
): LearningCompletionResult<ItemsCourseProgress> {
  const block = precheckLearningCompletion();
  if (block) {
    notifyLearningBlocked();
    return { ok: false, block };
  }

  const profile = loadProfile();
  const store = loadStore();
  const current = getProgress(store, profile.userId, kind);
  const session: ItemsPracticeSession = {
    at: new Date().toISOString(),
    ...params,
  };

  const studiedSet = new Set([...current.studiedItemIds, ...params.itemIds]);
  const updated: ItemsCourseProgress = {
    sessions: [session, ...current.sessions].slice(0, 100),
    studiedItemIds: [...studiedSet],
  };

  if (!store[profile.userId]) {
    store[profile.userId] = {
      room: { ...EMPTY },
      dining: { ...EMPTY },
    };
  }
  store[profile.userId][kind] = updated;
  saveStore(store);

  const meta = COURSE_META[kind];
  appendLearningHistory({
    employeeId: profile.userId,
    at: session.at,
    phase: "general",
    ask: "skill",
    title: meta.historyTitle,
    subtitle: `${params.mode} · 得分 ${params.score}% · ${params.correctCount}/${params.totalCount}`,
    score: params.score,
  });

  afterLearningCompletion();
  return { ok: true, data: updated };
}
