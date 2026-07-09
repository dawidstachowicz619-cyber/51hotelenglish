import type { RussianPracticeQuestion } from "@/lib/types/hotel-russian";
import type { HotelRussianDiningItem } from "@/lib/types/hotel-russian-dining-item";

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

/** 餐饮物品：看中文选俄语 / 看图选俄语 */
export function buildDiningItemPracticeQuestions(
  items: HotelRussianDiningItem[],
  mode: "text" | "image" = "text"
): RussianPracticeQuestion[] {
  const pool = items.map((i) => i.russian);
  const questions: RussianPracticeQuestion[] = [];

  items.forEach((item, i) => {
    const distractors = pickDistractors(pool, item.russian, 3, i * 7);
    if (distractors.length < 2) return;

    questions.push({
      id: `di-q-${item.id}-${mode}`,
      prompt: `「${item.chinese}」用俄语怎么说？`,
      options: shuffle([item.russian, ...distractors.slice(0, 3)], i),
      correctAnswer: item.russian,
      explanation: `${item.chinese} → ${item.russian}（${item.transliteration}）· ${item.english}`,
      audioText: item.russian,
    });
  });

  return questions;
}

export function pickRandomDiningItemSubset(
  items: HotelRussianDiningItem[],
  count: number,
  seed = Date.now()
): HotelRussianDiningItem[] {
  return shuffle(items, seed).slice(0, Math.min(count, items.length));
}
