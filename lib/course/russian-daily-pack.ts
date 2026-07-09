import { HOTEL_RUSSIAN_DINING_ITEMS } from "@/lib/data/hotel-russian-dining-items";
import { HOTEL_RUSSIAN_ROOM_ITEMS } from "@/lib/data/hotel-russian-room-items";
import type { RussianPracticeQuestion } from "@/lib/types/hotel-russian";
import { DINING_ITEM_CATEGORY_LABELS } from "@/lib/types/hotel-russian-dining-item";
import { ROOM_ITEM_CATEGORY_LABELS } from "@/lib/types/hotel-russian-room-item";
import type {
  DailyPackSource,
  RussianDailyPack,
  RussianDailyVocabItem,
} from "@/lib/types/russian-daily-checkin";

export const DAILY_VOCAB_SIZE = 5;

function shuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dateSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getTodayDateISO(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function yesterdayISO(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function isConsecutiveDay(previous: string | null, today: string): boolean {
  if (!previous) return false;
  return previous === yesterdayISO(today);
}

function categoryLabel(source: DailyPackSource, category: string): string {
  if (source === "room") {
    const labels = ROOM_ITEM_CATEGORY_LABELS as Record<string, { zh: string }>;
    return labels[category]?.zh ?? category;
  }
  const labels = DINING_ITEM_CATEGORY_LABELS as Record<string, { zh: string }>;
  return labels[category]?.zh ?? category;
}

function toVocabItem(
  source: DailyPackSource,
  item: {
    id: string;
    category: string;
    chinese: string;
    russian: string;
    transliteration: string;
    english: string;
  }
): RussianDailyVocabItem {
  return {
    id: item.id,
    source,
    category: categoryLabel(source, item.category),
    chinese: item.chinese,
    russian: item.russian,
    transliteration: item.transliteration,
    english: item.english,
  };
}

export function buildRussianDailyPack(date: string, userId: string): RussianDailyPack {
  const seed = dateSeed(`${date}:${userId}`);
  const source: DailyPackSource = seed % 2 === 0 ? "room" : "dining";
  const pool =
    source === "room"
      ? HOTEL_RUSSIAN_ROOM_ITEMS.map((item) => toVocabItem("room", item))
      : HOTEL_RUSSIAN_DINING_ITEMS.map((item) => toVocabItem("dining", item));

  const items = shuffle(pool, seed).slice(0, DAILY_VOCAB_SIZE);

  const title = source === "room" ? "今日客房词汇打卡" : "今日餐饮词汇打卡";
  const subtitle =
    source === "room"
      ? "5 个客房常用物品 · 图卡 + 小测 · 约 5 分钟"
      : "5 个餐饮常用物品 · 图卡 + 小测 · 约 5 分钟";

  return { date, source, title, subtitle, items };
}

function pickDistractors(pool: string[], correct: string, count: number, seed: number) {
  const others = [...new Set(pool.filter((s) => s !== correct))];
  const result: string[] = [];
  for (let i = 0; i < count && others.length > 0; i++) {
    const idx = (seed + i * 5) % others.length;
    result.push(others[idx]);
    others.splice(idx, 1);
  }
  return result;
}

export function buildDailyCheckinQuestions(
  items: RussianDailyVocabItem[]
): RussianPracticeQuestion[] {
  const pool = items.map((i) => i.russian);

  return items.map((item, i) => {
    const distractors = pickDistractors(pool, item.russian, 3, i * 7);
    return {
      id: `daily-q-${item.id}`,
      prompt: `「${item.chinese}」用俄语怎么说？`,
      options: shuffle([item.russian, ...distractors.slice(0, 3)], i + 100),
      correctAnswer: item.russian,
      explanation: `${item.chinese} → ${item.russian}（${item.transliteration}）`,
      audioText: item.russian,
    };
  });
}

export function getRecentDates(count: number, fromDate = getTodayDateISO()): string[] {
  const dates: string[] = [];
  const d = new Date(`${fromDate}T12:00:00`);
  for (let i = count - 1; i >= 0; i--) {
    const copy = new Date(d);
    copy.setDate(d.getDate() - i);
    dates.push(copy.toISOString().slice(0, 10));
  }
  return dates;
}
