import type { RussianPracticeQuestion } from "@/lib/types/hotel-russian";
import type { HotelRussianRoomItem } from "@/lib/types/hotel-russian-room-item";

function shuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

/** 客房物品：看中文选俄语 / 看图选俄语 */
export function buildRoomItemPracticeQuestions(
  items: HotelRussianRoomItem[],
  mode: "text" | "image" = "text"
): RussianPracticeQuestion[] {
  const pool = items.map((i) => i.russian);
  const questions: RussianPracticeQuestion[] = [];

  items.forEach((item, i) => {
    const distractors = pickDistractors(pool, item.russian, 3, i * 7);
    if (distractors.length < 2) return;

    questions.push({
      id: `ri-q-${item.id}-${mode}`,
      prompt: `「${item.chinese}」用俄语怎么说？`,
      options: shuffle([item.russian, ...distractors.slice(0, 3)], i),
      correctAnswer: item.russian,
      explanation: `${item.chinese} → ${item.russian}（${item.transliteration}）· ${item.english}`,
      audioText: item.russian,
    });
  });

  return questions;
}

export function pickRandomRoomItemSubset(
  items: HotelRussianRoomItem[],
  count: number,
  seed = Date.now()
): HotelRussianRoomItem[] {
  return shuffle(items, seed).slice(0, Math.min(count, items.length));
}
