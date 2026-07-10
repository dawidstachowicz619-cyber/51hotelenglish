import type { CefrLevel } from "@/lib/types/course";

export type GuestMood = "calm" | "impatient" | "angry" | "satisfied";

export type RoleplayMessage = {
  id: string;
  role: "guest" | "staff" | "system";
  english: string;
  chinese?: string;
  at: string;
};

export type RoleplayTurn = {
  staffHint: string;
  modelAnswer: string;
  expectedKeywords: string[];
  guestGood: string;
  guestGoodCn: string;
  guestNeutral: string;
  guestNeutralCn: string;
  guestPoor: string;
  guestPoorCn: string;
};

export type AiCoachScenario = {
  id: string;
  characterId: string;
  title: string;
  subtitle: string;
  department: string;
  level: CefrLevel;
  guestName: string;
  guestPersona: string;
  setting: string;
  description: string;
  objectives: string[];
  keyPhrases: { english: string; chinese: string }[];
  openingLine: string;
  openingLineCn: string;
  turns: RoleplayTurn[];
  imageCategory: "check-in" | "complaint" | "concierge" | "vip";
};

export type RoleplaySession = {
  scenarioId: string;
  startedAt: string;
  turnIndex: number;
  messages: RoleplayMessage[];
  scores: number[];
  mood: GuestMood;
  completed: boolean;
  completedAt?: string;
};

export type GuestReplyResult = {
  english: string;
  chinese: string;
  mood: GuestMood;
  staffScore: number;
  feedback: string;
  sessionComplete: boolean;
};
