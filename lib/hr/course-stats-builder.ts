import { loadLevelTestProgress } from "@/lib/assessment/level-progress-storage";
import { loadFrontDeskProgress } from "@/lib/course/progress-storage";
import { loadRussianCampaignProgress } from "@/lib/course/russian-campaign-progress-storage";
import { loadRussianDailyCheckIn } from "@/lib/course/russian-daily-checkin-storage";
import { loadRussianItemsProgress } from "@/lib/course/russian-items-progress-storage";
import { getCourseTrackForDepartment } from "@/lib/hr/hotel-department-storage";
import { getTotalFrontDeskLessons } from "@/lib/hr/lesson-totals";
import { buildProbationLearningReport } from "@/lib/hr/learning-record-builder";
import { getVisibleManagementModules } from "@/lib/hr/management-training-storage";
import { loadTrainingProgress } from "@/lib/hr/training-progress-storage";
import { buildProgressionMap } from "@/lib/course/progression-map";
import { loadProfile } from "@/lib/points/storage";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import type {
  CourseLearningStat,
  CourseStatCategory,
} from "@/lib/types/course-learning-stats";
import { CEFR_LEVELS } from "@/lib/types/course";
import {
  RUSSIAN_CAMPAIGN_LEVELS,
  RUSSIAN_CAMPAIGN_SENTENCES_PER_LEVEL,
  RUSSIAN_CAMPAIGN_WORDS_PER_LEVEL,
} from "@/lib/types/hotel-russian-campaign";

const MINUTES = {
  frontDeskLesson: 10,
  assessmentLevel: 25,
  russianDaily: 8,
  russianCampaignLevel: 12,
  russianItemsSession: 6,
  onboardingModule: 30,
  managementMinutePerSlide: 8,
} as const;

function deriveStatus(
  completed: number,
  total: number | null
): CourseLearningStat["status"] {
  if (completed <= 0) return "not_started";
  if (total !== null && completed >= total) return "completed";
  return "in_progress";
}

function avgScore(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function latestDate(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter(Boolean) as string[];
  if (valid.length === 0) return null;
  return valid.sort((a, b) => b.localeCompare(a))[0];
}

function isCurrentDeviceUser(employee: EmployeeLearningRecord): boolean {
  if (typeof window === "undefined") return false;
  return loadProfile().userId === employee.id;
}

function stat(
  partial: Omit<CourseLearningStat, "status"> & { status?: CourseLearningStat["status"] }
): CourseLearningStat {
  return {
    ...partial,
    status:
      partial.status ??
      deriveStatus(partial.completedCount, partial.totalCount),
  };
}

function buildFrontDeskStat(employee: EmployeeLearningRecord): CourseLearningStat {
  const totalLessons = employee.totalLessons || getTotalFrontDeskLessons();
  let completed = employee.completedLessons;
  let lastAt = employee.lastActiveAt;

  if (employee.isLiveUser && isCurrentDeviceUser(employee)) {
    const track = getCourseTrackForDepartment(employee.hotel, employee.department);
    const deptNodes = buildProgressionMap(track);
    const allCompleted = new Set(loadFrontDeskProgress().completedNodeIds);
    const deptCompleted = deptNodes.filter((n) => allCompleted.has(n.id)).length;
    if (deptCompleted > 0) {
      completed = deptCompleted;
    } else {
      completed = allCompleted.size;
    }
  }

  return stat({
    courseId: "front-desk",
    courseName: "酒店前厅英语",
    category: "english",
    completedCount: completed,
    totalCount: totalLessons,
    timeMinutes: completed * MINUTES.frontDeskLesson,
    score: null,
    lastStudiedAt: completed > 0 ? lastAt : null,
  });
}

function buildAssessmentStat(employee: EmployeeLearningRecord): CourseLearningStat {
  const total = CEFR_LEVELS.length;
  let passed = employee.passedAssessmentLevels.length;
  let bestScore = employee.assessmentScore > 0 ? employee.assessmentScore : null;
  let lastAt: string | null =
    employee.assessmentScore > 0 ? employee.lastActiveAt : null;

  if (employee.isLiveUser && isCurrentDeviceUser(employee)) {
    const progress = loadLevelTestProgress();
    const passedLevels = CEFR_LEVELS.filter((l) => progress[l]?.passed);
    passed = passedLevels.length;
    const scores = passedLevels
      .map((l) => progress[l]?.score ?? 0)
      .filter((s) => s > 0);
    bestScore = scores.length > 0 ? Math.max(...scores) : bestScore;
    lastAt = latestDate(
      passedLevels.map((l) => progress[l]?.date ?? null)
    );
  }

  return stat({
    courseId: "cefr-assessment",
    courseName: "CEFR 英语等级测评",
    category: "assessment",
    completedCount: passed,
    totalCount: total,
    timeMinutes: passed * MINUTES.assessmentLevel,
    score: bestScore,
    lastStudiedAt: lastAt,
  });
}

function buildRussianDailyStat(employee: EmployeeLearningRecord): CourseLearningStat {
  const record = loadRussianDailyCheckIn(employee.id);
  const sessions = Object.values(record.sessions).filter((s) => s.completed);
  const scores = sessions.map((s) => s.score);

  return stat({
    courseId: "russian-daily",
    courseName: "俄语每日打卡",
    category: "russian",
    completedCount: sessions.length,
    totalCount: null,
    timeMinutes: sessions.length * MINUTES.russianDaily,
    score: avgScore(scores),
    lastStudiedAt: latestDate(sessions.map((s) => s.completedAt ?? null)),
  });
}

function buildRussianCampaignStat(
  employee: EmployeeLearningRecord,
  department: "room" | "dining"
): CourseLearningStat {
  const progress = loadRussianCampaignProgress(department, employee.id);
  const completed = progress.completedLevelIds.length;
  const scores = Object.values(progress.levelScores);

  return stat({
    courseId: `russian-campaign-${department}`,
    courseName:
      department === "room" ? "俄语闯关 · 客房部" : "俄语闯关 · 餐饮部",
    category: "russian",
    completedCount: completed,
    totalCount: RUSSIAN_CAMPAIGN_LEVELS,
    timeMinutes: completed * MINUTES.russianCampaignLevel,
    score: avgScore(scores),
    lastStudiedAt: completed > 0 ? employee.lastActiveAt : null,
    // subtitle hint: each level = 5 sentences + 5 words stored in completedCount as levels
  });
}

function buildRussianItemsStat(
  employee: EmployeeLearningRecord,
  kind: "room" | "dining"
): CourseLearningStat {
  const progress = loadRussianItemsProgress(kind, employee.id);
  const scores = progress.sessions.map((s) => s.score);

  return stat({
    courseId: kind === "room" ? "russian-room-items" : "russian-dining-items",
    courseName: kind === "room" ? "客房物品俄语 100" : "餐饮物品俄语 100",
    category: "russian",
    completedCount: progress.studiedItemIds.length,
    totalCount: 100,
    timeMinutes: progress.sessions.length * MINUTES.russianItemsSession,
    score: avgScore(scores),
    lastStudiedAt: latestDate(progress.sessions.map((s) => s.at)),
  });
}

function buildOnboardingStat(employee: EmployeeLearningRecord): CourseLearningStat {
  const report = buildProbationLearningReport(employee);
  const items = report.phases
    .filter((p) => p.phase === "onboarding")
    .flatMap((p) => p.items);
  const completed = items.filter((i) => i.status === "completed").length;
  const scored = items.filter((i) => i.score != null && i.score > 0);
  const timeMinutes = items
    .filter((i) => i.status === "completed")
    .reduce((sum, i) => sum + (i.durationMinutes ?? MINUTES.onboardingModule), 0);

  return stat({
    courseId: "onboarding",
    courseName: "新员工入职培训",
    category: "onboarding",
    completedCount: completed,
    totalCount: items.length,
    timeMinutes,
    score: avgScore(scored.map((i) => i.score!)),
    lastStudiedAt:
      completed > 0
        ? latestDate(items.map((i) => i.completedAt))
        : null,
  });
}

function buildManagementStat(employee: EmployeeLearningRecord): CourseLearningStat {
  const dept = employee.department === "other" ? "reception" : employee.department;
  const modules = getVisibleManagementModules(employee.hotel, dept);
  const training = loadTrainingProgress(employee.id);
  const completed = modules.filter((m) =>
    training.completedModuleIds.includes(m.id)
  ).length;
  const scores = modules
    .map((m) => training.moduleScores[m.id])
    .filter((s): s is number => s != null && s > 0);
  const timeMinutes = modules
    .filter((m) => training.completedModuleIds.includes(m.id))
    .reduce(
      (sum, m) =>
        sum + Math.max(1, Math.ceil(m.slideCount * MINUTES.managementMinutePerSlide)),
      0
    );

  return stat({
    courseId: "management-training",
    courseName: "Management Training · 管理培训",
    category: "training",
    completedCount: completed,
    totalCount: modules.length,
    timeMinutes,
    score: avgScore(scores),
    lastStudiedAt: latestDate(
      modules.map((m) => training.completedAt[m.id] ?? null)
    ),
  });
}

const BUILDERS: ((employee: EmployeeLearningRecord) => CourseLearningStat)[] = [
  buildFrontDeskStat,
  buildAssessmentStat,
  buildRussianDailyStat,
  (e) => buildRussianCampaignStat(e, "room"),
  (e) => buildRussianCampaignStat(e, "dining"),
  (e) => buildRussianItemsStat(e, "room"),
  (e) => buildRussianItemsStat(e, "dining"),
  buildOnboardingStat,
  buildManagementStat,
];

export function buildEmployeeCourseStats(
  employee: EmployeeLearningRecord
): CourseLearningStat[] {
  return BUILDERS.map((fn) => fn(employee)).sort((a, b) => {
    const order: Record<CourseStatCategory, number> = {
      english: 0,
      assessment: 1,
      onboarding: 2,
      russian: 3,
      training: 4,
    };
    const diff = order[a.category] - order[b.category];
    if (diff !== 0) return diff;
    return a.courseName.localeCompare(b.courseName, "zh-CN");
  });
}

export function formatStudyTime(minutes: number): string {
  if (minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
}

export function formatStudyDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function summarizeCourseStats(stats: CourseLearningStat[]): {
  courseCount: number;
  totalTimeMinutes: number;
  avgScore: number | null;
} {
  const started = stats.filter((s) => s.status !== "not_started");
  const scored = started.filter((s) => s.score != null);
  return {
    courseCount: started.length,
    totalTimeMinutes: started.reduce((sum, s) => sum + s.timeMinutes, 0),
    avgScore:
      scored.length > 0
        ? Math.round(
            scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length
          )
        : null,
  };
}

/** 闯关关内已学句词数量（用于展示） */
export function campaignItemsLearned(completedLevels: number): number {
  return (
    completedLevels *
    (RUSSIAN_CAMPAIGN_SENTENCES_PER_LEVEL + RUSSIAN_CAMPAIGN_WORDS_PER_LEVEL)
  );
}
