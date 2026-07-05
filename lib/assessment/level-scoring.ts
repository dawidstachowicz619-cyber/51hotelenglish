import { PASS_THRESHOLD } from "@/lib/assessment/level-test-config";
import type {
  AssessmentQuestion,
  CEFRLevel,
  QuestionCategory,
} from "@/lib/types/assessment";
import { CEFR_LEVEL_INFO, COURSE_BY_LEVEL } from "@/lib/assessment/scoring";

export type LevelTestResult = {
  level: CEFRLevel;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  passThreshold: number;
  byCategory: Record<QuestionCategory, { correct: number; total: number }>;
  recommendation: string;
  coursePath: string;
};

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

function buildRecommendation(level: CEFRLevel, passed: boolean): string {
  if (!passed) {
    return `本次 ${level} 测评未达 ${PASS_THRESHOLD} 分通关线。建议复习该级别词汇与场景对话后重新挑战。`;
  }
  const recs: Record<CEFRLevel, string> = {
    A1: "A1 已通关！建议进入前厅英语 A1 关卡，从单词模块系统学习。",
    A2: "A2 已通关！建议练习前厅英语句子与基础对话模块。",
    B1: "B1 已通关！建议深入场景模拟与 AI 客诉入门练习。",
    B2: "B2 已通关！建议挑战高级客诉场景与 AI 陪练。",
    C1: "C1 已通关！您已具备高级专业英语能力，可进入 AI 高压场景陪练。",
  };
  return recs[level];
}

export function calculateLevelTestResult(
  level: CEFRLevel,
  questions: AssessmentQuestion[],
  answers: Map<string, boolean>
): LevelTestResult {
  let correct = 0;
  const byCategory = initCategoryRecord();

  for (const q of questions) {
    byCategory[q.category].total += 1;
    const isCorrect = answers.get(q.id) === true;
    if (isCorrect) {
      correct += 1;
      byCategory[q.category].correct += 1;
    }
  }

  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= PASS_THRESHOLD;
  const course = COURSE_BY_LEVEL[level];

  return {
    level,
    score,
    correct,
    total,
    passed,
    passThreshold: PASS_THRESHOLD,
    byCategory,
    recommendation: buildRecommendation(level, passed),
    coursePath: course.path,
  };
}

export { CEFR_LEVEL_INFO, COURSE_BY_LEVEL };
