export type PointsAction =
  | "identity_verified"
  | "assessment_complete"
  | "assessment_correct"
  | "daily_login"
  | "course_enter"
  | "pronunciation_practice";

export type PointsEvent = {
  id: string;
  action: PointsAction;
  points: number;
  label: string;
  timestamp: string;
};

export type UserPointsProfile = {
  userId: string;
  nickname: string;
  hotel: string;
  totalPoints: number;
  weeklyPoints: number;
  weekStart: string;
  cefrLevel: string;
  assessmentScore: number;
  history: PointsEvent[];
  lastDailyBonus: string | null;
  visitedCourses: string[];
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
