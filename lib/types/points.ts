export type PointsAction =
  | "identity_verified"
  | "assessment_complete"
  | "assessment_correct"
  | "daily_login"
  | "course_enter"
  | "pronunciation_practice"
  | "russian_daily_checkin"
  | "russian_campaign_level";

export type PointsEvent = {
  id: string;
  action: PointsAction;
  points: number;
  label: string;
  timestamp: string;
};

export type UserPointsProfile = {
  userId: string;
  /** 昵称，用于排行榜与展示 */
  nickname: string;
  /** 真实姓名，与 HR 登记一致 */
  realName?: string;
  hotel: string;
  totalPoints: number;
  weeklyPoints: number;
  weekStart: string;
  cefrLevel: string;
  assessmentScore: number;
  history: PointsEvent[];
  lastDailyBonus: string | null;
  visitedCourses: string[];
  /** 与 HR 花名册匹配的手机号 */
  phone?: string;
  /** 已由企业 HR 注册 */
  hrRegistered?: boolean;
};

export type LeaderboardEntry = {
  rank: number;
  id: string;
  nickname: string;
  hotel: string;
  points: number;
  cefrLevel: string;
  isCurrentUser?: boolean;
  badge?: "gold" | "silver" | "bronze";
};

export type LeaderboardPeriod = "weekly" | "alltime";

export type LeaderboardScope = "global" | "hotel";
