import type { UserPointsProfile } from "@/lib/types/points";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import type { LearningHistoryEntry } from "@/lib/types/learning-record";
import type { FrontDeskProgress } from "@/lib/types/course-progress";
import type { LevelTestProgress } from "@/lib/types/assessment";
import type { EmployeeRow, LearnerProfileRow } from "@/lib/supabase/database.types";

export function profileRowToUserPoints(row: LearnerProfileRow): UserPointsProfile {
  return {
    userId: row.id,
    nickname: row.nickname,
    hotel: row.hotel_name,
    phone: row.phone || undefined,
    hrRegistered: row.hr_registered,
    totalPoints: row.total_points,
    weeklyPoints: row.weekly_points,
    weekStart: row.week_start ?? "",
    cefrLevel: row.cefr_level,
    assessmentScore: row.assessment_score,
    history: Array.isArray(row.points_history)
      ? (row.points_history as UserPointsProfile["history"])
      : [],
    lastDailyBonus: row.last_daily_bonus,
    visitedCourses: Array.isArray(row.visited_courses)
      ? (row.visited_courses as string[])
      : [],
  };
}

export function userPointsToProfileRow(
  profile: UserPointsProfile,
  existing?: Partial<LearnerProfileRow>
): Partial<LearnerProfileRow> {
  return {
    id: profile.userId,
    nickname: profile.nickname,
    hotel_name: profile.hotel,
    phone: profile.phone ?? "",
    hr_registered: profile.hrRegistered ?? false,
    total_points: profile.totalPoints,
    weekly_points: profile.weeklyPoints,
    week_start: profile.weekStart || null,
    cefr_level: profile.cefrLevel,
    assessment_score: profile.assessmentScore,
    points_history: profile.history,
    visited_courses: profile.visitedCourses,
    last_daily_bonus: profile.lastDailyBonus,
    hotel_id: existing?.hotel_id ?? null,
    trial_lessons_used: existing?.trial_lessons_used ?? 0,
    employee_meta: existing?.employee_meta ?? {},
  };
}

export function employeeRowToRecord(
  row: EmployeeRow,
  hotelName: string
): EmployeeLearningRecord {
  const passedLevels = Array.isArray(row.passed_assessment_levels)
    ? (row.passed_assessment_levels as string[])
    : [];

  return {
    id: row.learner_profile_id ?? row.legacy_id ?? row.id,
    nickname: row.nickname,
    phone: row.phone,
    hotel: hotelName,
    department: row.department,
    role: row.role,
    cefrLevel: row.cefr_level,
    assessmentScore: row.assessment_score,
    passedAssessmentLevels: passedLevels,
    totalPoints: row.total_points,
    weeklyPoints: row.weekly_points,
    completedLessons: row.completed_lessons,
    totalLessons: row.total_lessons > 0 ? row.total_lessons : 1,
    courseProgressPercent: row.course_progress_percent,
    lastActiveAt: row.last_active_at ?? new Date().toISOString(),
    status: row.status,
    hireDate: row.hire_date ?? undefined,
    probationEndDate: row.probation_end_date ?? undefined,
    isImported: row.is_imported,
    isLiveUser: !!row.learner_profile_id,
  };
}

export function learningRecordToEmployeeRow(
  record: EmployeeLearningRecord,
  hotelId: string
): Partial<EmployeeRow> {
  return {
    legacy_id: record.isLiveUser ? null : record.id,
    hotel_id: hotelId,
    phone: record.phone,
    nickname: record.nickname,
    department: record.department,
    role: record.role,
    cefr_level: record.cefrLevel,
    assessment_score: record.assessmentScore,
    passed_assessment_levels: record.passedAssessmentLevels,
    total_points: record.totalPoints,
    weekly_points: record.weeklyPoints,
    completed_lessons: record.completedLessons,
    total_lessons: record.totalLessons,
    course_progress_percent: record.courseProgressPercent,
    last_active_at: record.lastActiveAt,
    status: record.status,
    hire_date: record.hireDate?.slice(0, 10) ?? null,
    probation_end_date: record.probationEndDate?.slice(0, 10) ?? null,
    is_imported: record.isImported ?? false,
    learner_profile_id: record.isLiveUser ? record.id : null,
  };
}

export function historyRowToEntry(
  row: {
    id: string;
    learner_id: string;
    occurred_at: string;
    phase: string;
    ask_dimension: string;
    title: string;
    subtitle: string | null;
    node_id: string | null;
    score: number | null;
  }
): LearningHistoryEntry {
  return {
    id: row.id,
    employeeId: row.learner_id,
    at: row.occurred_at,
    phase: row.phase as LearningHistoryEntry["phase"],
    ask: row.ask_dimension as LearningHistoryEntry["ask"],
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    nodeId: row.node_id ?? undefined,
    score: row.score ?? undefined,
  };
}

export type LearnerBootstrapPayload = {
  profile: UserPointsProfile;
  trialLessonsUsed: number;
  progress: {
    frontDesk: FrontDeskProgress;
    cefrTests: LevelTestProgress;
    russianDaily: Record<string, unknown>;
    russianCampaign: Record<string, unknown>;
    russianItems: Record<string, unknown>;
    employeeTraining: Record<string, unknown>;
    employeeMeta: Record<string, unknown>;
  };
  history: LearningHistoryEntry[];
};

export type LearnerSyncPayload = {
  profile?: UserPointsProfile;
  trialLessonsUsed?: number;
  progress?: Partial<LearnerBootstrapPayload["progress"]>;
  historyAppend?: Omit<LearningHistoryEntry, "id">[];
};
