import type { RussianPracticeQuestion } from "@/lib/types/hotel-russian";
import type {
  RussianCampaignSentence,
  RussianCampaignWord,
} from "@/lib/types/hotel-russian-campaign";

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

type QuizItem = {
  id: string;
  chinese: string;
  russian: string;
  transliteration: string;
  kind: "sentence" | "word";
};

/** 从本关 5 句 + 5 词中抽 5 题过关测验 */
export function buildCampaignLevelQuiz(
  sentences: RussianCampaignSentence[],
  words: RussianCampaignWord[],
  count = 5,
  seed = 0
): RussianPracticeQuestion[] {
  const items: QuizItem[] = [
    ...sentences.map((s) => ({
      id: s.id,
      chinese: s.chinese,
      russian: s.russian,
      transliteration: s.transliteration,
      kind: "sentence" as const,
    })),
    ...words.map((w) => ({
      id: w.id,
      chinese: w.chinese,
      russian: w.russian,
      transliteration: w.transliteration,
      kind: "word" as const,
    })),
  ];

  const picked = shuffle(items, seed).slice(0, Math.min(count, items.length));
  const pool = items.map((i) => i.russian);

  return picked.map((item, i) => {
    const distractors = pickDistractors(pool, item.russian, 3, i * 7);
    const label = item.kind === "word" ? "单词" : "句子";
    return {
      id: `camp-q-${item.id}`,
      prompt: `「${item.chinese}」用俄语怎么说？（${label}）`,
      options: shuffle([item.russian, ...distractors.slice(0, 3)], i),
      correctAnswer: item.russian,
      explanation: `${item.chinese} → ${item.russian}（${item.transliteration}）`,
      audioText: item.russian,
    };
  });
}
