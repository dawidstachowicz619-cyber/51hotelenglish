import type {
  RussianPracticeQuestion,
  RussianScenario,
} from "@/lib/types/hotel-russian";

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

/** 从单词与句子自动生成「看中文选俄语」练习 */
export function buildRussianPracticeQuestions(
  scenario: RussianScenario
): RussianPracticeQuestion[] {
  if (scenario.practice.length > 0) return scenario.practice;

  const pool = [
    ...scenario.words.map((w) => w.russian),
    ...scenario.sentences.map((s) => s.russian),
  ];

  const questions: RussianPracticeQuestion[] = [];

  scenario.words.forEach((word, i) => {
    const distractors = pickDistractors(pool, word.russian, 3, i * 7);
    if (distractors.length < 2) return;
    questions.push({
      id: `auto-w-${word.id}`,
      prompt: `「${word.chinese}」用俄语怎么说？`,
      options: shuffle([word.russian, ...distractors.slice(0, 3)], i),
      correctAnswer: word.russian,
      explanation: `${word.chinese} → ${word.russian}（${word.transliteration}）`,
      audioText: word.russian,
    });
  });

  scenario.sentences.slice(0, 3).forEach((sentence, i) => {
    const distractors = pickDistractors(pool, sentence.russian, 3, i * 11 + 3);
    if (distractors.length < 2) return;
    questions.push({
      id: `auto-s-${sentence.id}`,
      prompt: `【${sentence.context}】${sentence.chinese}`,
      options: shuffle([sentence.russian, ...distractors.slice(0, 3)], i + 5),
      correctAnswer: sentence.russian,
      explanation: sentence.transliteration,
      audioText: sentence.russian,
    });
  });

  return questions.slice(0, 8);
}
