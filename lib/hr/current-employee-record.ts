import { loadLevelTestProgress } from "@/lib/assessment/level-progress-storage";
import { loadFrontDeskProgress } from "@/lib/course/progress-storage";
import { getHotelDepartments } from "@/lib/hr/hotel-department-storage";
import { getTotalFrontDeskLessons } from "@/lib/hr/lesson-totals";
import { getHotelEmployees } from "@/lib/hr/roster-storage";
import { loadProfile } from "@/lib/points/storage";
import type { EmployeeDepartment, EmployeeLearningRecord } from "@/lib/types/hr-admin";
import { PROBATION_DAYS_DEFAULT } from "@/lib/types/learning-record";
import { CEFR_LEVELS } from "@/lib/types/course";

const META_KEY = "51he-employee-meta";

export type EmployeeMeta = {
  department: EmployeeDepartment;
  role: string;
  hireDate?: string;
  probationEndDate?: string;
};

export function loadEmployeeMeta(): EmployeeMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as EmployeeMeta) : null;
  } catch {
    return null;
  }
}

export function saveEmployeeMeta(meta: EmployeeMeta): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_KEY, JSON.stringify(meta));
  window.dispatchEvent(new Event("employee-meta-updated"));
}

export function buildCurrentEmployeeRecord(): EmployeeLearningRecord | null {
  if (typeof window === "undefined") return null;

  const profile = loadProfile();
  const nickname = profile.nickname?.trim();
  if (!nickname) return null;

  const hotel = profile.hotel?.trim() || "51HotelEnglish";
  const progress = loadFrontDeskProgress();
  const assessment = loadLevelTestProgress();
  const totalLessons = getTotalFrontDeskLessons();
  const completed = progress.completedNodeIds.length;

  const passedLevels = CEFR_LEVELS.filter((l) => assessment[l]?.passed);
  const bestScore = passedLevels.reduce((max, level) => {
    const score = assessment[level]?.score ?? 0;
    return Math.max(max, score);
  }, profile.assessmentScore ?? 0);

  const lastEvent = profile.history[0];
  const lastActiveAt = lastEvent?.timestamp ?? new Date().toISOString();

  const weeklyActive = profile.weeklyPoints > 0;
  const status: EmployeeLearningRecord["status"] =
    profile.totalPoints < 300
      ? "new"
      : weeklyActive
        ? "active"
        : "inactive";

  const rosterMatch =
    hotel !== "51HotelEnglish"
      ? getHotelEmployees(hotel).find((e) => e.id === profile.userId)
      : undefined;
  const meta = loadEmployeeMeta();

  const hireDate =
    rosterMatch?.hireDate ??
    meta?.hireDate ??
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString();
    })();

  const probationEndDate =
    rosterMatch?.probationEndDate ??
    meta?.probationEndDate ??
    (() => {
      const d = new Date(hireDate);
      d.setDate(d.getDate() + PROBATION_DAYS_DEFAULT);
      return d.toISOString();
    })();

  const defaultDepartment =
    getHotelDepartments(hotel)[0]?.id ?? "reception";

  return {
    id: profile.userId,
    nickname,
    phone: rosterMatch?.phone ?? profile.phone ?? "",
    hotel,
    department: rosterMatch?.department ?? meta?.department ?? defaultDepartment,
    role: rosterMatch?.role ?? meta?.role ?? "学员",
    cefrLevel: profile.cefrLevel !== "—" ? profile.cefrLevel : "未测评",
    assessmentScore: bestScore,
    passedAssessmentLevels: passedLevels,
    totalPoints: profile.totalPoints,
    weeklyPoints: profile.weeklyPoints,
    completedLessons: completed,
    totalLessons,
    courseProgressPercent:
      totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
    lastActiveAt,
    hireDate,
    probationEndDate,
    status,
    isLiveUser: true,
  };
}
