import {
  buildRussianDailyPack,
  getTodayDateISO,
  isConsecutiveDay,
} from "@/lib/course/russian-daily-pack";
import { appendLearningHistory } from "@/lib/hr/learning-history-storage";
import { addPoints } from "@/lib/points/storage";
import { loadProfile } from "@/lib/points/storage";
import { POINTS_RULES } from "@/lib/points/rules";
import type {
  DailyPackSource,
  RussianDailyCheckInRecord,
  RussianDailySession,
} from "@/lib/types/russian-daily-checkin";
import { RUSSIAN_DAILY_CHECKIN_KEY } from "@/lib/types/russian-daily-checkin";

const EMPTY: RussianDailyCheckInRecord = {
  lastCheckInDate: null,
  currentStreak: 0,
  longestStreak: 0,
  completedDates: [],
  sessions: {},
};

function loadAll(): Record<string, RussianDailyCheckInRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(RUSSIAN_DAILY_CHECKIN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, RussianDailyCheckInRecord>) : {};
  } catch {
    return {};
  }
}

function saveAll(store: Record<string, RussianDailyCheckInRecord>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUSSIAN_DAILY_CHECKIN_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("russian-daily-updated"));
}

export function loadRussianDailyCheckIn(userId?: string): RussianDailyCheckInRecord {
  const id = userId ?? loadProfile().userId;
  return loadAll()[id] ?? { ...EMPTY };
}

export function isTodayCheckInComplete(date = getTodayDateISO(), userId?: string): boolean {
  const record = loadRussianDailyCheckIn(userId);
  return record.sessions[date]?.completed === true;
}

export function completeRussianDailyCheckIn(
  score: number,
  itemIds: string[],
  source: DailyPackSource,
  date = getTodayDateISO()
): {
  record: RussianDailyCheckInRecord;
  earnedPoints: number;
  streakBonus: number;
} {
  const profile = loadProfile();
  const store = loadAll();
  const current = store[profile.userId] ?? { ...EMPTY };

  if (current.sessions[date]?.completed) {
    return { record: current, earnedPoints: 0, streakBonus: 0 };
  }

  let streak = 1;
  if (isConsecutiveDay(current.lastCheckInDate, date)) {
    streak = current.currentStreak + 1;
  }

  const completedDates = [...new Set([...current.completedDates, date])]
    .sort()
    .slice(-60);

  const session: RussianDailySession = {
    completed: true,
    score,
    itemIds,
    source,
    completedAt: new Date().toISOString(),
  };

  const updated: RussianDailyCheckInRecord = {
    lastCheckInDate: date,
    currentStreak: streak,
    longestStreak: Math.max(current.longestStreak, streak),
    completedDates,
    sessions: { ...current.sessions, [date]: session },
  };

  store[profile.userId] = updated;
  saveAll(store);

  let earnedPoints = POINTS_RULES.russian_daily_checkin.points;
  addPoints("russian_daily_checkin", {
    label: `俄语每日打卡 · 得分 ${score}%`,
  });

  let streakBonus = 0;
  if (streak === 7 || streak === 30) {
    streakBonus = streak === 7 ? 20 : 50;
    addPoints("russian_daily_checkin", {
      points: streakBonus,
      label: streak === 7 ? "连续打卡 7 天奖励" : "连续打卡 30 天奖励",
    });
    earnedPoints += streakBonus;
  }

  const pack = buildRussianDailyPack(date, profile.userId);
  appendLearningHistory({
    employeeId: profile.userId,
    at: new Date().toISOString(),
    phase: "general",
    ask: "skill",
    title: "俄语每日打卡",
    subtitle: `${pack.title} · 得分 ${score}% · 连续 ${streak} 天`,
    score,
  });

  return { record: updated, earnedPoints, streakBonus };
}
