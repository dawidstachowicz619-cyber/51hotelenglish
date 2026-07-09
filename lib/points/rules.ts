import type { PointsAction } from "@/lib/types/points";

export const POINTS_RULES: Record<
  PointsAction,
  { points: number; label: string }
> = {
  identity_verified: { points: 50, label: "完成身份验证" },
  assessment_complete: { points: 100, label: "完成 CEFR 测评" },
  assessment_correct: { points: 15, label: "测评答对" },
  daily_login: { points: 10, label: "每日登录" },
  course_enter: { points: 20, label: "进入课程学习" },
  pronunciation_practice: { points: 5, label: "发音练习" },
  russian_daily_checkin: { points: 25, label: "俄语每日打卡" },
  russian_campaign_level: { points: 15, label: "俄语闯关过关" },
};

export function getWeekStartISO(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function getLevelTitle(points: number): string {
  if (points >= 3000) return "英语大师";
  if (points >= 2000) return "高级达人";
  if (points >= 1000) return "学习能手";
  if (points >= 500) return "进步之星";
  if (points >= 100) return "初学者";
  return "新学员";
}
