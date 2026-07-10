import { buildEmployeeCourseStats } from "@/lib/hr/course-stats-builder";
import { getDemoEmployeesForHotel } from "@/lib/hr/demo-roster";
import { getAllPlatformEmployees } from "@/lib/hr/roster-storage";
import type {
  CourseStatCategory,
  PlatformCourseAggregate,
  PlatformCourseAnalytics,
} from "@/lib/types/course-learning-stats";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type AggAccumulator = PlatformCourseAggregate & { scores: number[] };

function emptyAggregate(
  courseId: string,
  courseName: string,
  category: CourseStatCategory
): AggAccumulator {
  return {
    courseId,
    courseName,
    category,
    learnerCount: 0,
    activeThisWeek: 0,
    totalCompletedCount: 0,
    totalTimeMinutes: 0,
    avgTimePerLearner: 0,
    avgScore: null,
    scores: [],
  };
}

function getCourseCatalogTemplate(): Pick<
  PlatformCourseAggregate,
  "courseId" | "courseName" | "category"
>[] {
  const demo =
    getDemoEmployeesForHotel("上海浦东丽思卡尔顿")[0] ??
    getAllPlatformEmployees()[0];
  if (!demo) {
    return [];
  }
  return buildEmployeeCourseStats(demo).map((s) => ({
    courseId: s.courseId,
    courseName: s.courseName,
    category: s.category,
  }));
}

export function buildPlatformCourseAnalytics(): PlatformCourseAnalytics {
  const employees = getAllPlatformEmployees();
  const now = Date.now();
  const courseMap = new Map<string, AggAccumulator>();

  for (const template of getCourseCatalogTemplate()) {
    courseMap.set(
      template.courseId,
      emptyAggregate(template.courseId, template.courseName, template.category)
    );
  }

  const activeLearnerIds = new Set<string>();

  for (const emp of employees) {
    let empActiveThisWeek = false;
    const stats = buildEmployeeCourseStats(emp);

    for (const s of stats) {
      if (s.status === "not_started") continue;

      let agg = courseMap.get(s.courseId);
      if (!agg) {
        agg = emptyAggregate(s.courseId, s.courseName, s.category);
        courseMap.set(s.courseId, agg);
      }

      agg.learnerCount += 1;
      agg.totalCompletedCount += s.completedCount;
      agg.totalTimeMinutes += s.timeMinutes;
      if (s.score != null) agg.scores.push(s.score);

      if (
        s.lastStudiedAt &&
        now - new Date(s.lastStudiedAt).getTime() < WEEK_MS
      ) {
        agg.activeThisWeek += 1;
        empActiveThisWeek = true;
      }
    }

    if (empActiveThisWeek) activeLearnerIds.add(emp.id);
  }

  const courses: PlatformCourseAggregate[] = [...courseMap.values()]
    .map(({ scores, ...agg }) => ({
      ...agg,
      avgTimePerLearner:
        agg.learnerCount > 0
          ? Math.round(agg.totalTimeMinutes / agg.learnerCount)
          : 0,
      avgScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
    }))
    .sort((a, b) => {
      const order: Record<CourseStatCategory, number> = {
        english: 0,
        assessment: 1,
        onboarding: 2,
        russian: 3,
        training: 4,
      };
      const diff = order[a.category] - order[b.category];
      if (diff !== 0) return diff;
      return b.learnerCount - a.learnerCount;
    });

  const totalStudyMinutes = courses.reduce(
    (sum, c) => sum + c.totalTimeMinutes,
    0
  );

  return {
    courses,
    totalLearners: employees.length,
    totalStudyMinutes,
    activeLearnersThisWeek: activeLearnerIds.size,
  };
}

export function formatPlatformQuantity(
  courseId: string,
  count: number
): string {
  if (courseId.startsWith("russian-campaign-")) {
    return `${count} 关`;
  }
  if (courseId === "russian-daily") {
    return `${count} 次打卡`;
  }
  if (courseId.includes("items")) {
    return `${count} 个词汇`;
  }
  if (courseId === "cefr-assessment") {
    return `${count} 级别通过`;
  }
  return `${count} 单元`;
}
