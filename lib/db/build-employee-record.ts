import { CEFR_LEVELS } from "@/lib/types/course";
import type { LevelTestProgress } from "@/lib/types/assessment";
import type { FrontDeskProgress } from "@/lib/types/course-progress";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import type { UserPointsProfile } from "@/lib/types/points";
import { PROBATION_DAYS_DEFAULT } from "@/lib/types/learning-record";

/** Server-side snapshot; totalLessons uses stored value or completed count. */
export function buildCurrentEmployeeRecordFromData(
  profile: UserPointsProfile,
  frontDesk: FrontDeskProgress,
  assessment: LevelTestProgress
): EmployeeLearningRecord | null {
  const nickname = profile.nickname?.trim();
  if (!nickname) return null;

  const hotel = profile.hotel?.trim() || "51HotelEnglish";
  const completed = frontDesk.completedNodeIds.length;
  const totalLessons = Math.max(completed, 1);

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

  const hireDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  })();

  const probationEndDate = (() => {
    const d = new Date(hireDate);
    d.setDate(d.getDate() + PROBATION_DAYS_DEFAULT);
    return d.toISOString();
  })();

  return {
    id: profile.userId,
    nickname,
    phone: profile.phone ?? "",
    hotel,
    department: "reception",
    role: "学员",
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
    isImported: profile.hrRegistered,
  };
}
