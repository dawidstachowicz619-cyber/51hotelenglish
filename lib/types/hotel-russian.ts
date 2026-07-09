export type RussianModuleTab = "words" | "sentences" | "dialogues" | "practice";

export type RussianWordItem = {
  id: string;
  russian: string;
  transliteration: string;
  chinese: string;
  english: string;
  example?: string;
};

export type RussianSentenceItem = {
  id: string;
  russian: string;
  transliteration: string;
  chinese: string;
  english: string;
  context: string;
};

export type RussianDialogueLine = {
  speaker: "staff" | "guest";
  russian: string;
  transliteration: string;
  chinese: string;
};

export type RussianDialogueItem = {
  id: string;
  title: string;
  subtitle: string;
  lines: RussianDialogueLine[];
};

export type RussianPracticeQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  audioText?: string;
};

export type RussianScenario = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: "reception" | "fnb" | "housekeeping";
  words: RussianWordItem[];
  sentences: RussianSentenceItem[];
  dialogues: RussianDialogueItem[];
  practice: RussianPracticeQuestion[];
};

export function countRussianScenario(scenario: RussianScenario) {
  return {
    words: scenario.words.length,
    sentences: scenario.sentences.length,
    dialogues: scenario.dialogues.length,
    practice: scenario.practice.length,
  };
}
