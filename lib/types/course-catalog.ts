import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { TrainingQuestion, TrainingSlide } from "@/lib/types/hr-training";
import type { AskDimension, LearningPhase } from "@/lib/types/learning-record";

export type CatalogCategory =
  | "front-desk"
  | "onboarding"
  | "general"
  | "english"
  | "compliance";

export const CATALOG_CATEGORY_LABELS: Record<CatalogCategory, string> = {
  "front-desk": "前厅岗位",
  onboarding: "入职培训",
  general: "通用技能",
  english: "英语能力",
  compliance: "合规安全",
};

export type CatalogLinkDelivery = {
  type: "link";
  href: string;
  linkLabel: string;
};

export type CatalogTrainingDelivery = {
  type: "training";
  slides: TrainingSlide[];
  questions: TrainingQuestion[];
};

export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  category: CatalogCategory;
  phase: LearningPhase;
  ask: AskDimension;
  durationMinutes: number;
  lessonCount: number;
  delivery: CatalogLinkDelivery | CatalogTrainingDelivery;
  tags?: string[];
};

export type HotelCourseAssignment = {
  catalogCourseId: string;
  department: EmployeeDepartment | "all";
  assignedAt: string;
  required: boolean;
};

export const HOTEL_COURSE_ASSIGNMENTS_KEY = "51he-hotel-course-assignments";
