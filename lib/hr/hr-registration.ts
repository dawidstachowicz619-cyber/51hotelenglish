import { buildCurrentEmployeeRecord } from "@/lib/hr/current-employee-record";
import { isTrialHotel } from "@/lib/hr/learner-hotel-options";
import { getHotelEmployees, upsertHotelEmployee } from "@/lib/hr/roster-storage";
import {
  HR_REGISTRATION_EVENT,
  TRIAL_LESSON_LIMIT,
  type LearningCompletionBlock,
} from "@/lib/types/learning-gate";
import { loadProfile, updateProfile } from "@/lib/points/storage";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";

const TRIAL_KEY = "51he-trial-lessons-used";

export function normalizeLearnerPhone(phone: string): string {
  return phone.trim().replace(/\s|-/g, "").replace(/^\+86/, "");
}

export function isValidLearnerPhone(phone: string): boolean {
  return /^1\d{10}$/.test(normalizeLearnerPhone(phone));
}

export function findHrRosterMatch(): EmployeeLearningRecord | null {
  const profile = loadProfile();
  const phone = normalizeLearnerPhone(profile.phone ?? "");
  const hotel = profile.hotel?.trim();
  if (!phone || !hotel || hotel === "51HotelEnglish" || isTrialHotel(hotel)) return null;

  return (
    getHotelEmployees(hotel).find(
      (e) => e.phone === phone && e.isImported
    ) ?? null
  );
}

/** 学员是否已由企业 HR 在后台注册（手机号与花名册匹配） */
export function isHrRegisteredUser(): boolean {
  if (typeof window === "undefined") return false;
  const profile = loadProfile();
  if (profile.hrRegistered) return true;

  const match = findHrRosterMatch();
  if (!match) return false;

  linkLearnerToHrRecord(match);
  return true;
}

function linkLearnerToHrRecord(hrRecord: EmployeeLearningRecord): void {
  const live = buildCurrentEmployeeRecord();
  if (!live) return;

  upsertHotelEmployee(live.hotel, {
    ...hrRecord,
    ...live,
    id: hrRecord.id,
    phone: hrRecord.phone,
    nickname: live.nickname || hrRecord.nickname,
    isImported: true,
    isLiveUser: true,
  });

  updateProfile((p) => ({ ...p, hrRegistered: true }));
  window.dispatchEvent(new Event("hr-registration-updated"));
}

/** 保存档案后尝试与 HR 花名册绑定 */
export function tryLinkHrRegistration(): boolean {
  if (isHrRegisteredUser()) return true;
  const match = findHrRosterMatch();
  if (!match) return false;
  linkLearnerToHrRecord(match);
  return true;
}

export function getTrialLessonsUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(TRIAL_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function getTrialLessonsRemaining(): number {
  if (isHrRegisteredUser()) return Infinity;
  return Math.max(0, TRIAL_LESSON_LIMIT - getTrialLessonsUsed());
}

function incrementTrialLessonsUsed(): void {
  if (typeof window === "undefined") return;
  const next = getTrialLessonsUsed() + 1;
  localStorage.setItem(TRIAL_KEY, String(next));
  window.dispatchEvent(new Event("trial-lessons-updated"));
}

export function precheckLearningCompletion(): LearningCompletionBlock | null {
  if (isHrRegisteredUser()) return null;
  return "hr_registration_required";
}

export function notifyLearningBlocked(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(HR_REGISTRATION_EVENT));
}

export function afterLearningCompletion(): void {
  // 未注册学员不可完成课程学习，不再计入体验课
}

export function canStartNewLearning(): boolean {
  return precheckLearningCompletion() === null;
}

/** 开始新一课前检查；未通过时会弹出 HR 注册提示 */
export function guardLearningStart(): boolean {
  if (canStartNewLearning()) return true;
  notifyLearningBlocked();
  return false;
}
