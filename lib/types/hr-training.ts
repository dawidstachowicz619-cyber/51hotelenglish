import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { AskDimension, LearningPhase } from "@/lib/types/learning-record";

export type TrainingSlide = {
  id: string;
  order: number;
  title: string;
  narration: string;
  bullets: string[];
  /** 预估讲解时长（秒） */
  durationSec: number;
};

export type TrainingQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type HrTrainingModule = {
  id: string;
  hotel: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  department: EmployeeDepartment | "all";
  phase: LearningPhase;
  ask: AskDimension;
  slides: TrainingSlide[];
  questions: TrainingQuestion[];
  slideCount: number;
  questionCount: number;
};

export type EmployeeTrainingProgress = {
  completedModuleIds: string[];
  moduleScores: Record<string, number>;
  completedAt: Record<string, string>;
};

export const HR_TRAINING_STORAGE_KEY = "51he-hr-training-modules";
export const EMPLOYEE_TRAINING_PROGRESS_KEY = "51he-employee-training-progress";

export const SUPPORTED_DOC_EXTENSIONS = [".txt", ".md", ".docx"] as const;

export type SupportedDocExtension = (typeof SUPPORTED_DOC_EXTENSIONS)[number];
