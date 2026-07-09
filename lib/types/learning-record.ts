import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";

/** ASK：态度 · 知识 · 技能 */
export type AskDimension = "attitude" | "skill" | "knowledge";

export const ASK_LABELS: Record<AskDimension, string> = {
  attitude: "态度 (A)",
  skill: "技能 (S)",
  knowledge: "知识 (K)",
};

export const ASK_SHORT: Record<AskDimension, string> = {
  attitude: "态度",
  skill: "技能",
  knowledge: "知识",
};

/** 学习阶段：入职培训 → 岗位学习 → 通用技能 → 管理培训 */
export type LearningPhase = "onboarding" | "role" | "general" | "management";

export const LEARNING_PHASE_LABELS: Record<LearningPhase, string> = {
  onboarding: "新员工入职培训",
  role: "在岗岗位学习",
  general: "通用岗位知识技能",
  management: "Management Training · 管理培训",
};

export const LEARNING_PHASE_ORDER: LearningPhase[] = [
  "onboarding",
  "role",
  "general",
  "management",
];

export type LearningItemStatus = "completed" | "in_progress" | "not_started";

export type LearningRecordItem = {
  id: string;
  phase: LearningPhase;
  ask: AskDimension;
  title: string;
  subtitle?: string;
  completedAt: string | null;
  status: LearningItemStatus;
  score?: number;
  durationMinutes?: number;
};

export type PhaseSummary = {
  phase: LearningPhase;
  label: string;
  items: LearningRecordItem[];
  completed: number;
  total: number;
  percent: number;
};

export type AskSummary = {
  dimension: AskDimension;
  label: string;
  completed: number;
  total: number;
  percent: number;
};

/** 试用期学习档案（可打印） */
export type ProbationLearningReport = {
  employee: EmployeeLearningRecord;
  hireDate: string;
  probationEndDate: string;
  generatedAt: string;
  phases: PhaseSummary[];
  askSummary: AskSummary[];
  overallPercent: number;
  probationStatus: "in_progress" | "completed" | "upcoming";
  recommendation: string;
};

export const PROBATION_DAYS_DEFAULT = 90;

export const LEARNING_HISTORY_KEY = "51he-learning-history";

export type LearningHistoryEntry = {
  id: string;
  employeeId: string;
  at: string;
  phase: LearningPhase;
  ask: AskDimension;
  title: string;
  subtitle?: string;
  nodeId?: string;
  score?: number;
};
