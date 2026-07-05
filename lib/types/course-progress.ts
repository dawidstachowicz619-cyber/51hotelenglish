import type { CefrLevel, CourseModuleTab } from "@/lib/types/course";
import type { FrontDeskDepartmentId } from "@/lib/types/front-desk-department";

export type ProgressionNode = {
  id: string;
  order: number;
  cefrLevel: CefrLevel;
  departmentId: FrontDeskDepartmentId;
  departmentTitle: string;
  workScenarioId: string;
  workScenarioTitle: string;
  workScenarioSubtitle: string;
  module: CourseModuleTab;
  moduleLabel: string;
  zoneLabel: string;
  /** 单个模拟场景 id（module 为 scenario 且拆分为多关时） */
  simulationId?: string;
  simulationTitle?: string;
  simulationNumber?: number;
};

export type FrontDeskProgress = {
  completedNodeIds: string[];
};

export const FRONT_DESK_PROGRESS_KEY = "51he-front-desk-progress";

export const MODULE_LABELS: Record<CourseModuleTab, string> = {
  words: "单词",
  sentences: "句子",
  dialogues: "对话",
  scenario: "情景",
};

export const MODULE_EXERCISE_HINTS: Record<CourseModuleTab, string> = {
  words: "听音选词 · 拼写",
  sentences: "听句选择",
  dialogues: "对话听选",
  scenario: "情景选择",
};

export const MODULE_ORDER: CourseModuleTab[] = [
  "words",
  "sentences",
  "dialogues",
  "scenario",
];
