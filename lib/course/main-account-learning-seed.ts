import { saveLevelTestResult } from "@/lib/assessment/level-progress-storage";
import { buildProgressionMap } from "@/lib/course/progression-map";
import {
  loadFrontDeskProgress,
  saveFrontDeskProgress,
} from "@/lib/course/progress-storage";
import { logRussianItemsPracticeSession } from "@/lib/course/russian-items-progress-storage";
import { loadRussianCampaignProgress } from "@/lib/course/russian-campaign-progress-storage";
import { loadRussianDailyCheckIn } from "@/lib/course/russian-daily-checkin-storage";
import { moduleToAsk } from "@/lib/hr/ask-mapping";
import {
  loadEmployeeMeta,
  saveEmployeeMeta,
} from "@/lib/hr/current-employee-record";
import {
  appendLearningHistory,
  getLearningHistory,
} from "@/lib/hr/learning-history-storage";
import { syncCurrentUserToRoster } from "@/lib/hr/sync-employee";
import { loadProfile, updateProfile } from "@/lib/points/storage";
import type { FrontDeskDepartmentId } from "@/lib/types/front-desk-department";
import { campaignLevelId } from "@/lib/types/hotel-russian-campaign";
import { RUSSIAN_DAILY_CHECKIN_KEY } from "@/lib/types/russian-daily-checkin";
import { RUSSIAN_CAMPAIGN_PROGRESS_KEY } from "@/lib/types/hotel-russian-campaign";

import { isHrRegisteredUser } from "@/lib/hr/hr-registration";

const SEED_FLAG_KEY = "51he-main-account-learning-seeded";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function dateOnlyDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function hasExistingLearning(userId: string): boolean {
  const progress = loadFrontDeskProgress();
  const history = getLearningHistory(userId);
  const daily = loadRussianDailyCheckIn(userId);
  const campaignRoom = loadRussianCampaignProgress("room", userId);
  return (
    progress.completedNodeIds.length > 0 ||
    history.length > 0 ||
    daily.completedDates.length > 0 ||
    campaignRoom.completedLevelIds.length > 0
  );
}

function seedFrontDeskProgress(
  userId: string,
  department: FrontDeskDepartmentId
): void {
  const nodes = buildProgressionMap(department);
  const count = Math.max(8, Math.round(nodes.length * 0.28));
  const completedNodeIds = nodes.slice(0, count).map((n) => n.id);

  saveFrontDeskProgress({ completedNodeIds });

  for (let i = 0; i < count; i++) {
    const node = nodes[i];
    const title = node.simulationTitle
      ? `${node.workScenarioTitle} · 模拟 #${node.simulationNumber ?? ""}`
      : `${node.workScenarioTitle} · ${node.moduleLabel}`;

    appendLearningHistory({
      employeeId: userId,
      at: daysAgo(count - i),
      phase: "role",
      ask: moduleToAsk(node.module),
      title,
      subtitle: node.zoneLabel,
      nodeId: node.id,
    });
  }
}

function seedAssessment(userId: string): void {
  const levels = [
    { level: "A1" as const, score: 82, correct: 16, total: 20 },
    { level: "A2" as const, score: 88, correct: 18, total: 20 },
  ];

  for (let i = 0; i < levels.length; i++) {
    const { level, score, correct, total } = levels[i];
    saveLevelTestResult(level, {
      passed: true,
      score,
      correct,
      total,
      date: daysAgo(14 - i * 3),
    });

    appendLearningHistory({
      employeeId: userId,
      at: daysAgo(14 - i * 3),
      phase: "onboarding",
      ask: "skill",
      title: `CEFR ${level} 水平测评`,
      subtitle: `得分 ${score}%`,
      score,
    });
  }
}

function seedRussianDaily(userId: string): void {
  const dates = [6, 5, 4, 2, 1, 0].map(dateOnlyDaysAgo);
  const raw = localStorage.getItem(RUSSIAN_DAILY_CHECKIN_KEY);
  const store = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  const sessions: Record<
    string,
    {
      completed: boolean;
      score: number;
      itemIds: string[];
      source: "room" | "dining";
      completedAt: string;
    }
  > = {};

  dates.forEach((date, i) => {
    const score = 78 + (i % 4) * 5;
    sessions[date] = {
      completed: true,
      score,
      itemIds: [`ri-${String(i + 1).padStart(3, "0")}`],
      source: i % 2 === 0 ? "room" : "dining",
      completedAt: daysAgo(6 - i),
    };

    appendLearningHistory({
      employeeId: userId,
      at: daysAgo(6 - i),
      phase: "general",
      ask: "skill",
      title: "俄语每日打卡",
      subtitle: `得分 ${score}% · 连续 ${i + 1} 天`,
      score,
    });
  });

  store[userId] = {
    lastCheckInDate: dates[dates.length - 1],
    currentStreak: dates.length,
    longestStreak: dates.length,
    completedDates: dates,
    sessions,
  };
  localStorage.setItem(RUSSIAN_DAILY_CHECKIN_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("russian-daily-updated"));
}

function seedRussianCampaign(userId: string): void {
  const raw = localStorage.getItem(RUSSIAN_CAMPAIGN_PROGRESS_KEY);
  const store = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};

  const roomLevels = [1, 2, 3, 4];
  const levelScores: Record<string, number> = {};
  const completedLevelIds: string[] = [];

  roomLevels.forEach((level, i) => {
    const id = campaignLevelId("room", level);
    completedLevelIds.push(id);
    const score = 85 + i * 3;
    levelScores[id] = score;

    appendLearningHistory({
      employeeId: userId,
      at: daysAgo(10 - i),
      phase: "general",
      ask: "skill",
      title: `俄语必修 · 客房部第 ${level} 关`,
      subtitle: `客房部 · 第 ${level} 关 · ${score}%`,
      score,
    });
  });

  store[userId] = {
    room: { completedLevelIds, levelScores },
    dining: { completedLevelIds: [], levelScores: {} },
  };
  localStorage.setItem(RUSSIAN_CAMPAIGN_PROGRESS_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("russian-campaign-updated"));
}

function seedRussianItems(): void {
  const roomIds = Array.from({ length: 24 }, (_, i) =>
    `ri-${String(i + 1).padStart(3, "0")}`
  );
  const diningIds = Array.from({ length: 18 }, (_, i) =>
    `di-${String(i + 1).padStart(3, "0")}`
  );

  logRussianItemsPracticeSession("room", {
    score: 90,
    correctCount: 18,
    totalCount: 20,
    mode: "看图选词",
    itemIds: roomIds.slice(0, 20),
  });

  logRussianItemsPracticeSession("room", {
    score: 85,
    correctCount: 17,
    totalCount: 20,
    mode: "看中文选词",
    itemIds: roomIds.slice(4, 24),
  });

  logRussianItemsPracticeSession("dining", {
    score: 88,
    correctCount: 18,
    totalCount: 20,
    mode: "看图选词",
    itemIds: diningIds,
  });
}

function seedOnboardingHistory(userId: string): void {
  const items = [
    { title: "酒店文化与品牌服务理念", days: 20, ask: "attitude" as const },
    { title: "安全卫生与合规须知", days: 18, ask: "knowledge" as const },
    { title: "仪容仪表与职业形象", days: 15, ask: "attitude" as const },
    { title: "平台使用与学习计划", days: 14, ask: "knowledge" as const },
  ];

  for (const item of items) {
    appendLearningHistory({
      employeeId: userId,
      at: daysAgo(item.days),
      phase: "onboarding",
      ask: item.ask,
      title: item.title,
      subtitle: "在线学习 · 入职必修",
    });
  }
}

export function isMainAccountLearningSeeded(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SEED_FLAG_KEY) === userId;
}

/** 为主账号生成基于各课程的演示学习记录，仅 HR 已注册时执行一次 */
export function ensureMainAccountLearningSeed(): boolean {
  if (typeof window === "undefined") return false;
  if (!isHrRegisteredUser()) return false;

  const profile = loadProfile();
  if (!profile.nickname?.trim()) return false;
  if (isMainAccountLearningSeeded(profile.userId)) return false;
  if (hasExistingLearning(profile.userId)) {
    localStorage.setItem(SEED_FLAG_KEY, profile.userId);
    return false;
  }

  const meta = loadEmployeeMeta();
  const department = (meta?.department ?? "reception") as FrontDeskDepartmentId;

  if (!meta) {
    saveEmployeeMeta({
      department,
      role: "前台接待",
      hireDate: daysAgo(45),
      probationEndDate: daysAgo(-45),
    });
  }

  updateProfile((p) => ({
    ...p,
    cefrLevel: p.cefrLevel === "—" ? "A2" : p.cefrLevel,
    assessmentScore: p.assessmentScore > 0 ? p.assessmentScore : 88,
    totalPoints: Math.max(p.totalPoints, 1280),
    weeklyPoints: Math.max(p.weeklyPoints, 180),
  }));

  seedOnboardingHistory(profile.userId);
  seedFrontDeskProgress(profile.userId, department);
  seedAssessment(profile.userId);
  seedRussianDaily(profile.userId);
  seedRussianCampaign(profile.userId);
  seedRussianItems();

  localStorage.setItem(SEED_FLAG_KEY, profile.userId);
  syncCurrentUserToRoster();

  window.dispatchEvent(new Event("course-progress-updated"));
  window.dispatchEvent(new Event("assessment-updated"));
  window.dispatchEvent(new Event("hr-roster-updated"));

  return true;
}
