import type { TrainingSlideSection } from "@/lib/types/hr-training";

/** 培训幻灯片内置简图类型 */
export type TrainingSlideIllustration =
  | "course-objective"
  | "course-knowledge"
  | "course-case"
  | "management-value"
  | "key-actions"
  | "coaching"
  | "review"
  | "team"
  | "hotel-service"
  | "communication"
  | "growth";

export const SLIDE_ILLUSTRATION_CYCLE: TrainingSlideIllustration[] = [
  "course-objective",
  "course-knowledge",
  "course-case",
  "key-actions",
  "team",
  "hotel-service",
  "communication",
  "growth",
];

export function illustrationForSlideIndex(index: number): TrainingSlideIllustration {
  return SLIDE_ILLUSTRATION_CYCLE[index % SLIDE_ILLUSTRATION_CYCLE.length];
}

/** 按讲解阶段选择主图，同一阶段多页时轮换 */
export function illustrationForSection(
  section: TrainingSlideSection,
  indexInSection = 0
): TrainingSlideIllustration {
  const variants: Record<TrainingSlideSection, TrainingSlideIllustration[]> = {
    objective: ["course-objective", "management-value"],
    knowledge: ["course-knowledge", "key-actions", "team", "communication"],
    case: ["course-case", "hotel-service", "coaching"],
  };
  const list = variants[section];
  return list[indexInSection % list.length];
}

export const SLIDE_ILLUSTRATION_LABELS: Record<TrainingSlideIllustration, string> = {
  "course-objective": "课程目标",
  "course-knowledge": "知识点讲解",
  "course-case": "案例应用",
  "management-value": "管理价值",
  "key-actions": "关键动作",
  coaching: "辅导反馈",
  review: "复盘改进",
  team: "团队协作",
  "hotel-service": "酒店服务",
  communication: "沟通协作",
  growth: "持续成长",
};
