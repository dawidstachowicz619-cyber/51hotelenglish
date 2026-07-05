import {
  getDepartmentLabel,
} from "@/lib/hr/hotel-department-storage";
import {
  EMPLOYEE_DEPARTMENT_LABELS,
  type EmployeeDepartment,
  type EmployeeLearningRecord,
  type HotelLearningStats,
} from "@/lib/types/hr-admin";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function deptLabel(
  hotel: string | undefined,
  department: EmployeeDepartment
): string {
  if (hotel) return getDepartmentLabel(hotel, department);
  return EMPLOYEE_DEPARTMENT_LABELS[department] ?? department;
}

export function computeHotelStats(
  employees: EmployeeLearningRecord[],
  hotel?: string
): HotelLearningStats {
  if (employees.length === 0) {
    return {
      totalEmployees: 0,
      activeThisWeek: 0,
      avgProgressPercent: 0,
      avgAssessmentScore: 0,
      assessmentPassRate: 0,
      totalCompletedLessons: 0,
      departmentBreakdown: [],
      departmentRanking: [],
      levelBreakdown: [],
    };
  }

  const now = Date.now();
  const isActiveThisWeek = (e: EmployeeLearningRecord) =>
    now - new Date(e.lastActiveAt).getTime() < WEEK_MS;

  const withAssessment = employees.filter((e) => e.assessmentScore > 0);
  const passedCount = employees.filter(
    (e) => e.passedAssessmentLevels.length > 0
  ).length;

  const deptMap = new Map<
    EmployeeDepartment,
    {
      count: number;
      progressSum: number;
      assessmentSum: number;
      assessmentCount: number;
      pointsSum: number;
      activeCount: number;
    }
  >();

  const levelMap = new Map<string, number>();

  for (const emp of employees) {
    const dept = deptMap.get(emp.department) ?? {
      count: 0,
      progressSum: 0,
      assessmentSum: 0,
      assessmentCount: 0,
      pointsSum: 0,
      activeCount: 0,
    };
    dept.count += 1;
    dept.progressSum += emp.courseProgressPercent;
    dept.pointsSum += emp.totalPoints;
    if (emp.assessmentScore > 0) {
      dept.assessmentSum += emp.assessmentScore;
      dept.assessmentCount += 1;
    }
    if (isActiveThisWeek(emp)) dept.activeCount += 1;
    deptMap.set(emp.department, dept);

    const level = emp.cefrLevel === "未测评" ? "未测评" : emp.cefrLevel;
    levelMap.set(level, (levelMap.get(level) ?? 0) + 1);
  }

  const departmentBreakdown = [...deptMap.entries()].map(([department, data]) => ({
    department,
    label: deptLabel(hotel ?? employees[0]?.hotel, department),
    count: data.count,
    avgProgress: Math.round(data.progressSum / data.count),
  }));

  const maxAvgPoints = Math.max(
    ...[...deptMap.values()].map((d) => d.pointsSum / d.count),
    1
  );

  const departmentRanking = [...deptMap.entries()]
    .map(([department, data]) => {
      const avgProgress = Math.round(data.progressSum / data.count);
      const avgAssessmentScore =
        data.assessmentCount > 0
          ? Math.round(data.assessmentSum / data.assessmentCount)
          : 0;
      const avgPoints = Math.round(data.pointsSum / data.count);
      const activeRate = Math.round((data.activeCount / data.count) * 100);
      const normalizedPoints = Math.round((avgPoints / maxAvgPoints) * 100);
      const compositeScore = Math.round(
        avgProgress * 0.45 +
          avgAssessmentScore * 0.3 +
          normalizedPoints * 0.15 +
          activeRate * 0.1
      );

      return {
        rank: 0,
        department,
        label: deptLabel(hotel ?? employees[0]?.hotel, department),
        count: data.count,
        avgProgress,
        avgAssessmentScore,
        avgPoints,
        activeRate,
        compositeScore,
      };
    })
    .sort((a, b) => {
      if (b.compositeScore !== a.compositeScore) {
        return b.compositeScore - a.compositeScore;
      }
      if (b.avgProgress !== a.avgProgress) return b.avgProgress - a.avgProgress;
      return b.avgAssessmentScore - a.avgAssessmentScore;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const activeThisWeek = employees.filter(isActiveThisWeek).length;

  return {
    totalEmployees: employees.length,
    activeThisWeek,
    avgProgressPercent: Math.round(
      employees.reduce((s, e) => s + e.courseProgressPercent, 0) /
        employees.length
    ),
    avgAssessmentScore:
      withAssessment.length > 0
        ? Math.round(
            withAssessment.reduce((s, e) => s + e.assessmentScore, 0) /
              withAssessment.length
          )
        : 0,
    assessmentPassRate: Math.round((passedCount / employees.length) * 100),
    totalCompletedLessons: employees.reduce(
      (s, e) => s + e.completedLessons,
      0
    ),
    departmentBreakdown,
    departmentRanking,
    levelBreakdown: [...levelMap.entries()]
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count),
  };
}
