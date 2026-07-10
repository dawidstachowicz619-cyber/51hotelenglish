import type { UserPointsProfile, PointsEvent, PointsAction } from "@/lib/types/points";
import { getWeekStartISO, POINTS_RULES } from "@/lib/points/rules";
import { scheduleCloudPush } from "@/lib/storage/cloud-sync";
import { clearLearnerLocalData } from "@/lib/storage/learner-local-data";
import { clearLocalLearnerSession } from "@/lib/auth/local-learner-auth";

const STORAGE_KEY = "51he-points-profile";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createDefaultProfile(): UserPointsProfile {
  return {
    userId: generateId(),
    nickname: "",
    hotel: "",
    totalPoints: 0,
    weeklyPoints: 0,
    weekStart: getWeekStartISO(),
    cefrLevel: "—",
    assessmentScore: 0,
    history: [],
    lastDailyBonus: null,
    visitedCourses: [],
  };
}

export function loadProfile(): UserPointsProfile {
  if (typeof window === "undefined") return createDefaultProfile();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const profile = JSON.parse(raw) as UserPointsProfile;
    return resetWeeklyIfNeeded(profile);
  } catch {
    return createDefaultProfile();
  }
}

export function saveProfile(profile: UserPointsProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function resetWeeklyIfNeeded(profile: UserPointsProfile): UserPointsProfile {
  const currentWeek = getWeekStartISO();
  if (profile.weekStart === currentWeek) return profile;
  return {
    ...profile,
    weeklyPoints: 0,
    weekStart: currentWeek,
  };
}

export function updateProfile(
  updater: (profile: UserPointsProfile) => UserPointsProfile
): UserPointsProfile {
  const current = loadProfile();
  const updated = resetWeeklyIfNeeded(updater(current));
  saveProfile(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("points-updated", { detail: updated }));
    scheduleCloudPush();
  }
  return updated;
}

export function resetLearnerSession(): UserPointsProfile {
  clearLearnerLocalData();
  clearLocalLearnerSession();
  const profile = createDefaultProfile();
  saveProfile(profile);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("points-updated", { detail: profile }));
    window.dispatchEvent(new Event("hr-registration-updated"));
  }
  return profile;
}

export function setUserInfo(
  nickname: string,
  hotel: string,
  phone?: string,
  realName?: string
): UserPointsProfile {
  const normalizedPhone = phone?.trim()
    ? phone.trim().replace(/\s|-/g, "").replace(/^\+86/, "")
    : "";

  return updateProfile((p) => ({
    ...p,
    nickname: nickname.trim(),
    realName: (realName ?? p.realName ?? "").trim() || p.realName,
    hotel: hotel.trim() || "51HotelEnglish",
    phone: normalizedPhone || p.phone || "",
  }));
}

export function addPoints(
  action: PointsAction,
  extra?: { label?: string; points?: number; meta?: Record<string, unknown> }
): { profile: UserPointsProfile; earned: number; event: PointsEvent } | null {
  const rule = POINTS_RULES[action];
  const points = extra?.points ?? rule.points;
  const label = extra?.label ?? rule.label;

  const event: PointsEvent = {
    id: generateId(),
    action,
    points,
    label,
    timestamp: new Date().toISOString(),
  };

  const profile = updateProfile((p) => ({
    ...p,
    totalPoints: p.totalPoints + points,
    weeklyPoints: p.weeklyPoints + points,
    history: [event, ...p.history].slice(0, 50),
    ...(metaString(extra?.meta, "cefrLevel")
      ? { cefrLevel: metaString(extra?.meta, "cefrLevel")! }
      : {}),
    ...(metaNumber(extra?.meta, "assessmentScore") !== undefined
      ? { assessmentScore: metaNumber(extra?.meta, "assessmentScore")! }
      : {}),
  }));

  return { profile, earned: points, event };
}

function metaString(
  meta: Record<string, unknown> | undefined,
  key: string
): string | undefined {
  const v = meta?.[key];
  return typeof v === "string" ? v : undefined;
}

function metaNumber(
  meta: Record<string, unknown> | undefined,
  key: string
): number | undefined {
  const v = meta?.[key];
  return typeof v === "number" ? v : undefined;
}

export function claimDailyBonus(): UserPointsProfile | null {
  const today = new Date().toISOString().slice(0, 10);
  const profile = loadProfile();
  if (profile.lastDailyBonus === today) return null;

  updateProfile((p) => ({
    ...p,
    lastDailyBonus: today,
    totalPoints: p.totalPoints + POINTS_RULES.daily_login.points,
    weeklyPoints: p.weeklyPoints + POINTS_RULES.daily_login.points,
    history: [
      {
        id: generateId(),
        action: "daily_login" as const,
        points: POINTS_RULES.daily_login.points,
        label: POINTS_RULES.daily_login.label,
        timestamp: new Date().toISOString(),
      },
      ...p.history,
    ].slice(0, 50),
  }));

  return loadProfile();
}

export function claimCourseVisit(courseSlug: string): number {
  const profile = loadProfile();
  if (profile.visitedCourses.includes(courseSlug)) return 0;

  updateProfile((p) => ({
    ...p,
    visitedCourses: [...p.visitedCourses, courseSlug],
    totalPoints: p.totalPoints + POINTS_RULES.course_enter.points,
    weeklyPoints: p.weeklyPoints + POINTS_RULES.course_enter.points,
    history: [
      {
        id: generateId(),
        action: "course_enter" as const,
        points: POINTS_RULES.course_enter.points,
        label: `进入课程：${courseSlug}`,
        timestamp: new Date().toISOString(),
      },
      ...p.history,
    ].slice(0, 50),
  }));

  return POINTS_RULES.course_enter.points;
}

export function awardAssessmentPoints(
  correctCount: number,
  totalQuestions: number,
  cefrLevel: string,
  percentage: number
): number {
  let total = 0;

  addPoints("assessment_complete", {
    meta: { cefrLevel, assessmentScore: percentage },
  });
  total += POINTS_RULES.assessment_complete.points;

  if (correctCount > 0) {
    const correctPoints = correctCount * POINTS_RULES.assessment_correct.points;
    addPoints("assessment_correct", {
      points: correctPoints,
      label: `测评答对 ${correctCount}/${totalQuestions} 题`,
    });
    total += correctPoints;
  }

  return total;
}

export function awardIdentityPoints(): number {
  const profile = loadProfile();
  const already = profile.history.some((e) => e.action === "identity_verified");
  if (already) return 0;
  addPoints("identity_verified");
  return POINTS_RULES.identity_verified.points;
}
