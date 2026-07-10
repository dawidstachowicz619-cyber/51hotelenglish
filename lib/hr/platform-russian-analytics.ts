import { buildEmployeeCourseStats } from "@/lib/hr/course-stats-builder";
import { getAllManagedHotels } from "@/lib/hr/hotel-registry";
import { buildPlatformCourseAnalytics, formatPlatformQuantity } from "@/lib/hr/platform-course-analytics";
import { getAllPlatformEmployees, getHotelEmployees } from "@/lib/hr/roster-storage";
import type { PlatformCourseAggregate } from "@/lib/types/course-learning-stats";
import {
  RUSSIAN_CAMPAIGN_LEVELS,
} from "@/lib/types/hotel-russian-campaign";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const RUSSIAN_COURSE_IDS = [
  "russian-daily",
  "russian-campaign-room",
  "russian-campaign-dining",
  "russian-room-items",
  "russian-dining-items",
] as const;

export type RussianHotelAggregate = {
  hotel: string;
  learnerCount: number;
  activeThisWeek: number;
  dailyCheckIns: number;
  campaignLevels: number;
  vocabStudied: number;
  totalTimeMinutes: number;
  avgScore: number | null;
};

export type PlatformRussianAnalytics = {
  courses: PlatformCourseAggregate[];
  hotels: RussianHotelAggregate[];
  summary: {
    platformLearners: number;
    russianLearners: number;
    activeThisWeek: number;
    totalStudyMinutes: number;
    totalDailyCheckIns: number;
    totalCampaignLevels: number;
    totalVocabStudied: number;
    avgScore: number | null;
  };
};

function isRussianCourse(courseId: string): boolean {
  return (RUSSIAN_COURSE_IDS as readonly string[]).includes(courseId);
}

function sumRussianFromStats(
  stats: ReturnType<typeof buildEmployeeCourseStats>
): {
  hasActivity: boolean;
  activeThisWeek: boolean;
  timeMinutes: number;
  dailyCheckIns: number;
  campaignLevels: number;
  vocabStudied: number;
  scores: number[];
} {
  const now = Date.now();
  let hasActivity = false;
  let activeThisWeek = false;
  let timeMinutes = 0;
  let dailyCheckIns = 0;
  let campaignLevels = 0;
  let vocabStudied = 0;
  const scores: number[] = [];

  for (const s of stats) {
    if (!isRussianCourse(s.courseId) || s.status === "not_started") continue;
    hasActivity = true;
    timeMinutes += s.timeMinutes;
    if (s.score != null) scores.push(s.score);
    if (
      s.lastStudiedAt &&
      now - new Date(s.lastStudiedAt).getTime() < WEEK_MS
    ) {
      activeThisWeek = true;
    }
    if (s.courseId === "russian-daily") dailyCheckIns += s.completedCount;
    if (s.courseId.startsWith("russian-campaign-")) campaignLevels += s.completedCount;
    if (s.courseId.includes("items")) vocabStudied += s.completedCount;
  }

  return {
    hasActivity,
    activeThisWeek,
    timeMinutes,
    dailyCheckIns,
    campaignLevels,
    vocabStudied,
    scores,
  };
}

export function buildPlatformRussianAnalytics(): PlatformRussianAnalytics {
  const platform = buildPlatformCourseAnalytics();
  const courses = platform.courses.filter((c) => isRussianCourse(c.courseId));

  const allEmployees = getAllPlatformEmployees();
  const russianLearnerIds = new Set<string>();
  const activeThisWeekIds = new Set<string>();
  let totalDailyCheckIns = 0;
  let totalCampaignLevels = 0;
  let totalVocabStudied = 0;
  const allScores: number[] = [];

  for (const emp of allEmployees) {
    const r = sumRussianFromStats(buildEmployeeCourseStats(emp));
    if (!r.hasActivity) continue;
    russianLearnerIds.add(emp.id);
    if (r.activeThisWeek) activeThisWeekIds.add(emp.id);
    totalDailyCheckIns += r.dailyCheckIns;
    totalCampaignLevels += r.campaignLevels;
    totalVocabStudied += r.vocabStudied;
    allScores.push(...r.scores);
  }

  const hotels: RussianHotelAggregate[] = getAllManagedHotels().map((hotel) => {
    const employees = getHotelEmployees(hotel);
    let learnerCount = 0;
    let activeThisWeek = 0;
    let dailyCheckIns = 0;
    let campaignLevels = 0;
    let vocabStudied = 0;
    let totalTimeMinutes = 0;
    const scores: number[] = [];

    for (const emp of employees) {
      const r = sumRussianFromStats(buildEmployeeCourseStats(emp));
      if (!r.hasActivity) continue;
      learnerCount += 1;
      if (r.activeThisWeek) activeThisWeek += 1;
      dailyCheckIns += r.dailyCheckIns;
      campaignLevels += r.campaignLevels;
      vocabStudied += r.vocabStudied;
      totalTimeMinutes += r.timeMinutes;
      scores.push(...r.scores);
    }

    return {
      hotel,
      learnerCount,
      activeThisWeek,
      dailyCheckIns,
      campaignLevels,
      vocabStudied,
      totalTimeMinutes,
      avgScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
    };
  }).sort((a, b) => b.learnerCount - a.learnerCount);

  const totalStudyMinutes = courses.reduce((s, c) => s + c.totalTimeMinutes, 0);

  return {
    courses,
    hotels,
    summary: {
      platformLearners: platform.totalLearners,
      russianLearners: russianLearnerIds.size,
      activeThisWeek: activeThisWeekIds.size,
      totalStudyMinutes,
      totalDailyCheckIns,
      totalCampaignLevels,
      totalVocabStudied,
      avgScore:
        allScores.length > 0
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : null,
    },
  };
}

export function formatRussianCourseProgress(
  courseId: string,
  completed: number
): string {
  if (courseId === "russian-daily") {
    return `${completed} 次打卡`;
  }
  if (courseId === "russian-campaign-room" || courseId === "russian-campaign-dining") {
    const pct = Math.round((completed / RUSSIAN_CAMPAIGN_LEVELS) * 100);
    return `${completed}/${RUSSIAN_CAMPAIGN_LEVELS} 关（${pct}%）`;
  }
  if (courseId === "russian-room-items" || courseId === "russian-dining-items") {
    return `${completed}/100 词（${completed}%）`;
  }
  return formatPlatformQuantity(courseId, completed);
}

export { formatPlatformQuantity };
