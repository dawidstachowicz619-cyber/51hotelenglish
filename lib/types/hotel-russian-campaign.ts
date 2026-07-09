export type RussianCampaignDepartment = "room" | "dining";

export type RussianCampaignSentence = {
  id: string;
  russian: string;
  transliteration: string;
  chinese: string;
  english: string;
  context: string;
};

export type RussianCampaignWord = {
  id: string;
  russian: string;
  transliteration: string;
  chinese: string;
  english: string;
  category: string;
};

export type RussianCampaignLevel = {
  id: string;
  department: RussianCampaignDepartment;
  level: number;
  zone: string;
  title: string;
  subtitle: string;
  sentences: RussianCampaignSentence[];
  words: RussianCampaignWord[];
};

export type RussianCampaign = {
  department: RussianCampaignDepartment;
  titleZh: string;
  titleEn: string;
  description: string;
  totalLevels: number;
  totalSentences: number;
  totalWords: number;
  levels: RussianCampaignLevel[];
};

export type RussianCampaignProgress = {
  completedLevelIds: string[];
  levelScores: Record<string, number>;
};

export const RUSSIAN_CAMPAIGN_PROGRESS_KEY = "51he-russian-campaign-progress";

export const RUSSIAN_CAMPAIGN_LEVELS = 30;
export const RUSSIAN_CAMPAIGN_SENTENCES_PER_LEVEL = 5;
export const RUSSIAN_CAMPAIGN_WORDS_PER_LEVEL = 5;
export const RUSSIAN_CAMPAIGN_SENTENCES_PER_DEPT =
  RUSSIAN_CAMPAIGN_LEVELS * RUSSIAN_CAMPAIGN_SENTENCES_PER_LEVEL;
export const RUSSIAN_CAMPAIGN_WORDS_PER_DEPT =
  RUSSIAN_CAMPAIGN_LEVELS * RUSSIAN_CAMPAIGN_WORDS_PER_LEVEL;

export function campaignLevelId(
  department: RussianCampaignDepartment,
  level: number
): string {
  return `${department}-lv-${String(level).padStart(2, "0")}`;
}
