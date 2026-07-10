export type CourseStatCategory =
  | "english"
  | "russian"
  | "assessment"
  | "training"
  | "onboarding";

export type CourseLearningStat = {
  courseId: string;
  courseName: string;
  category: CourseStatCategory;
  completedCount: number;
  totalCount: number | null;
  /** 累计学习时长（分钟） */
  timeMinutes: number;
  /** 平均或最佳得分；无分数时为 null */
  score: number | null;
  lastStudiedAt: string | null;
  status: "completed" | "in_progress" | "not_started";
};

export const COURSE_STAT_CATEGORY_LABELS: Record<CourseStatCategory, string> = {
  english: "英语岗位",
  russian: "俄语课程",
  assessment: "测评",
  training: "管理培训",
  onboarding: "入职培训",
};

/** 平台级：单门课程全站汇总 */
export type PlatformCourseAggregate = {
  courseId: string;
  courseName: string;
  category: CourseStatCategory;
  /** 有学习记录的学员数 */
  learnerCount: number;
  /** 本周有学习的学员数 */
  activeThisWeek: number;
  /** 全站累计学习数量（关/次/词等） */
  totalCompletedCount: number;
  /** 全站累计学习时长（分钟） */
  totalTimeMinutes: number;
  /** 人均学习时长（分钟） */
  avgTimePerLearner: number;
  /** 有分数学员的平均得分 */
  avgScore: number | null;
};

export type PlatformCourseAnalytics = {
  courses: PlatformCourseAggregate[];
  totalLearners: number;
  totalStudyMinutes: number;
  activeLearnersThisWeek: number;
};
