export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "reading"
  | "matching"
  | "dialogue_oral";

export type QuestionCategory =
  | "vocabulary"
  | "grammar"
  | "reading"
  | "hotel"
  | "speaking";

type BaseQuestion = {
  id: string;
  level: CEFRLevel;
  category: QuestionCategory;
  type: QuestionType;
  prompt: string;
  explanation: string;
  image?: string;
};

export type MultipleChoiceQuestion = BaseQuestion & {
  type: "multiple_choice";
  options: string[];
  correctIndex: number;
};

export type TrueFalseQuestion = BaseQuestion & {
  type: "true_false";
  statement: string;
  correct: boolean;
};

export type FillBlankQuestion = BaseQuestion & {
  type: "fill_blank";
  sentence: string;
  options: string[];
  correctIndex: number;
};

export type ReadingQuestion = BaseQuestion & {
  type: "reading";
  passage: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export type MatchingQuestion = BaseQuestion & {
  type: "matching";
  term: string;
  options: string[];
  correctIndex: number;
};

export type DialogueOralQuestion = BaseQuestion & {
  type: "dialogue_oral";
  category: "speaking";
  scenario: string;
  guestLine: string;
  guestLineChinese: string;
  image?: string;
  options: string[];
  correctIndex: number;
  modelAnswer: string;
  speakKeywords: string[];
};

export type AssessmentQuestion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ReadingQuestion
  | MatchingQuestion
  | DialogueOralQuestion;

export type AssessmentResult = {
  level: CEFRLevel;
  score: number;
  maxScore: number;
  percentage: number;
  byLevel: Record<CEFRLevel, { correct: number; total: number }>;
  byCategory: Record<QuestionCategory, { correct: number; total: number }>;
  recommendation: string;
  coursePath: string;
};

export const CEFR_LEVEL_INFO: Record<
  CEFRLevel,
  { label: string; title: string; description: string }
> = {
  A1: {
    label: "A1",
    title: "入门级 Breakthrough",
    description: "能理解和使用日常基本表达，进行简单自我介绍和提问。",
  },
  A2: {
    label: "A2",
    title: "基础级 Waystage",
    description: "能处理简单直接的交流，描述背景、环境和迫切需求。",
  },
  B1: {
    label: "B1",
    title: "进阶级 Threshold",
    description: "能应对旅行和工作中大多数情况，描述经历和事件。",
  },
  B2: {
    label: "B2",
    title: "高阶 Vantage",
    description: "能流利自然地互动，就广泛话题进行清晰详细的表达。",
  },
  C1: {
    label: "C1",
    title: "精通级 Effective Operational Proficiency",
    description: "能灵活有效地运用语言，用于社交、学术和专业目的。",
  },
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "选择题",
  true_false: "判断题",
  fill_blank: "填空题",
  reading: "阅读理解",
  matching: "词汇匹配",
  dialogue_oral: "对话口语",
};
