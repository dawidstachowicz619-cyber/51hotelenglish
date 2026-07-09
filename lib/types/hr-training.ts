import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { AskDimension, LearningPhase } from "@/lib/types/learning-record";
import type { TrainingSlideIllustration } from "@/lib/types/training-slide-illustration";

/** 讲解阶段：课程目标 → 知识点讲解 → 案例应用 */
export type TrainingSlideSection = "objective" | "knowledge" | "case";

export type TrainingSlide = {
  id: string;
  order: number;
  title: string;
  narration: string;
  bullets: string[];
  /** 预估讲解时长（秒） */
  durationSec: number;
  /** 讲解阶段 */
  section?: TrainingSlideSection;
  /** 内置简图（自动生成课程） */
  illustration?: TrainingSlideIllustration;
};

export type TrainingQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type TrainingDeliveryType = "slides" | "video";

export type TrainingCourseSource = "builtin" | "hr" | "platform";

export type HrTrainingModule = {
  id: string;
  hotel: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  department: EmployeeDepartment | "all";
  phase: LearningPhase;
  ask: AskDimension;
  /** slides=图文讲解；video=视频课 */
  deliveryType?: TrainingDeliveryType;
  /** 视频地址或 IndexedDB 引用 __idb__:moduleId */
  videoUrl?: string;
  videoDurationSec?: number;
  source?: TrainingCourseSource;
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
export const PLATFORM_MANAGEMENT_COURSES_KEY = "51he-platform-management-courses";
export const EMPLOYEE_TRAINING_PROGRESS_KEY = "51he-employee-training-progress";

export const SUPPORTED_DOC_EXTENSIONS = [
  ".pptx",
  ".docx",
  ".txt",
  ".md",
] as const;

export type SupportedDocExtension = (typeof SUPPORTED_DOC_EXTENSIONS)[number];

export { SUPPORTED_VIDEO_EXTENSIONS } from "@/lib/hr/training-video-storage";
