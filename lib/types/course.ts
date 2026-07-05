export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export const CEFR_LABELS: Record<CefrLevel, string> = {
  A1: "入门级",
  A2: "基础级",
  B1: "进阶级",
  B2: "高阶级",
  C1: "精通级",
};

export type WordItem = {
  id: string;
  english: string;
  phonetic: string;
  chinese: string;
  example?: string;
  image?: string;
};

export type SentenceItem = {
  id: string;
  english: string;
  chinese: string;
  context: string;
};

export type DialogueLine = {
  speaker: "staff" | "guest";
  english: string;
  chinese: string;
};

export type DialogueItem = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  lines: DialogueLine[];
};

export type ScenarioStep = {
  english: string;
  chinese: string;
};

export type ScenarioItem = {
  id: string;
  title: string;
  setting: string;
  description: string;
  objectives: string[];
  keyPhrases: ScenarioStep[];
  sampleDialogue: DialogueLine[];
  categoryId?: string;
  categoryTitle?: string;
  simulationNumber?: number;
};

export type CourseModuleTab = "words" | "sentences" | "dialogues" | "scenario";

/** @deprecated use CourseModuleTab */
export type CourseTab = CourseModuleTab;

export type WorkScenarioLevel = {
  level: CefrLevel;
  words: WordItem[];
  sentences: SentenceItem[];
  dialogues: DialogueItem[];
  scenarios: ScenarioItem[];
};

export type WorkScenario = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  levels: WorkScenarioLevel[];
};

export function getScenarioLevelContent(
  scenario: WorkScenario,
  level: CefrLevel
): WorkScenarioLevel | undefined {
  return scenario.levels.find((l) => l.level === level);
}

export function getScenariosForLevel(
  scenarios: WorkScenario[],
  level: CefrLevel
): WorkScenario[] {
  return scenarios.filter((s) => s.levels.some((l) => l.level === level));
}

export function countLevelContent(content: WorkScenarioLevel) {
  return {
    words: content.words.length,
    sentences: content.sentences.length,
    dialogues: content.dialogues.length,
    scenario: content.scenarios.length,
  };
}
