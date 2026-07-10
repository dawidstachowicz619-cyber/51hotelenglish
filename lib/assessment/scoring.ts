import type {
  AssessmentQuestion,
  AssessmentResult,
  CEFRLevel,
  QuestionCategory,
} from "@/lib/types/assessment";
import { CEFR_LEVEL_INFO } from "@/lib/types/assessment";

const LEVEL_WEIGHT: Record<CEFRLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
};

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1"];

const COURSE_BY_LEVEL: Record<CEFRLevel, { path: string; label: string }> = {
  A1: { path: "/courses/front-desk", label: "前厅英语 · 基础词汇" },
  A2: { path: "/courses/front-desk", label: "前厅英语 · 句子与对话" },
  B1: { path: "/courses/front-desk", label: "前厅英语 · 场景实战" },
  B2: { path: "/courses/front-desk", label: "前厅英语 · 高级客诉" },
  C1: { path: "/courses/front-desk", label: "前厅英语 · 高级场景" },
};

function initLevelRecord() {
  return Object.fromEntries(
    LEVELS.map((l) => [l, { correct: 0, total: 0 }])
  ) as Record<CEFRLevel, { correct: number; total: number }>;
}

function initCategoryRecord() {
  const cats: QuestionCategory[] = [
    "vocabulary",
    "grammar",
    "reading",
    "hotel",
    "speaking",
  ];
  return Object.fromEntries(
    cats.map((c) => [c, { correct: 0, total: 0 }])
  ) as Record<QuestionCategory, { correct: number; total: number }>;
}

function determineLevel(
  weightedScore: number,
  maxWeighted: number,
  byLevel: Record<CEFRLevel, { correct: number; total: number }>
): CEFRLevel {
  const pct = maxWeighted > 0 ? (weightedScore / maxWeighted) * 100 : 0;

  let levelFromPct: CEFRLevel = "A1";
  if (pct >= 82) levelFromPct = "C1";
  else if (pct >= 65) levelFromPct = "B2";
  else if (pct >= 48) levelFromPct = "B1";
  else if (pct >= 28) levelFromPct = "A2";

  let levelFromAccuracy: CEFRLevel = "A1";
  for (const level of LEVELS) {
    const { correct, total } = byLevel[level];
    if (total > 0 && correct / total >= 0.5) {
      levelFromAccuracy = level;
    }
  }

  const idx1 = LEVELS.indexOf(levelFromPct);
  const idx2 = LEVELS.indexOf(levelFromAccuracy);
  return LEVELS[Math.min(idx1, idx2 + 1)] ?? levelFromPct;
}

function buildRecommendation(level: CEFRLevel): string {
  const recs: Record<CEFRLevel, string> = {
    A1: "建议从前厅英语「单词」模块开始，打好基础词汇量，再逐步进入句子和对话练习。",
    A2: "您已具备基础沟通能力。建议重点练习前厅英语「句子」和「对话」模块，提升实际接待表达。",
    B1: "您已能应对大多数酒店工作场景。建议深入「场景」模块，并开始尝试 AI 客诉模拟。",
    B2: "您的英语水平较高。建议挑战高级客诉场景，精进 diplomatic communication 技巧。",
    C1: "您已具备高级专业英语能力。建议继续前厅高级课程，并学习更细分的 F&B、客房专项课程。",
  };
  return recs[level];
}

export function calculateAssessmentResult(
  questions: AssessmentQuestion[],
  answers: Map<string, boolean>
): AssessmentResult {
  let score = 0;
  let maxScore = 0;
  const byLevel = initLevelRecord();
  const byCategory = initCategoryRecord();

  for (const q of questions) {
    const weight = LEVEL_WEIGHT[q.level];
    maxScore += weight;
    byLevel[q.level].total += 1;
    byCategory[q.category].total += 1;

    const correct = answers.get(q.id) === true;
    if (correct) {
      score += weight;
      byLevel[q.level].correct += 1;
      byCategory[q.category].correct += 1;
    }
  }

  const level = determineLevel(score, maxScore, byLevel);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const course = COURSE_BY_LEVEL[level];

  return {
    level,
    score,
    maxScore,
    percentage,
    byLevel,
    byCategory,
    recommendation: buildRecommendation(level),
    coursePath: course.path,
  };
}

export function getLevelColor(level: CEFRLevel): string {
  const colors: Record<CEFRLevel, string> = {
    A1: "bg-secondary",
    A2: "bg-primary",
    B1: "bg-accent",
    B2: "bg-purple",
    C1: "bg-red",
  };
  return colors[level];
}

export { CEFR_LEVEL_INFO, COURSE_BY_LEVEL };
