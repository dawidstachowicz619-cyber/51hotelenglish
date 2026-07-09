export type DailyPackSource = "room" | "dining";

export type RussianDailyVocabItem = {
  id: string;
  source: DailyPackSource;
  category: string;
  chinese: string;
  russian: string;
  transliteration: string;
  english: string;
};

export type RussianDailyPack = {
  date: string;
  source: DailyPackSource;
  title: string;
  subtitle: string;
  items: RussianDailyVocabItem[];
};

export type RussianDailySession = {
  completed: boolean;
  score: number;
  itemIds: string[];
  source: DailyPackSource;
  completedAt?: string;
};

export type RussianDailyCheckInRecord = {
  lastCheckInDate: string | null;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  sessions: Record<string, RussianDailySession>;
};

export const RUSSIAN_DAILY_CHECKIN_KEY = "51he-russian-daily-checkin";
