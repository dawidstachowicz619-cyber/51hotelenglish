import type { CourseModuleTab } from "@/lib/types/course";

export type LevelExerciseType =
  | "listen_pick_word"
  | "spell_word"
  | "listen_pick_sentence"
  | "listen_pick_line"
  | "situational_pick";

export const EXERCISE_TYPE_LABELS: Record<LevelExerciseType, string> = {
  listen_pick_word: "听音选词",
  spell_word: "单词拼写",
  listen_pick_sentence: "听句选择",
  listen_pick_line: "对话听选",
  situational_pick: "情景选择",
};

export type LevelExercise = {
  id: string;
  type: LevelExerciseType;
  module: CourseModuleTab;
  /** 英文题目音频（单词/句子/对话） */
  audioText: string;
  /** 中文题目说明（屏幕显示） */
  prompt: string;
  /** 英文语音讲解（TTS 播报） */
  voiceIntro: string;
  chineseHint?: string;
  phoneticHint?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
};

export const MIN_QUESTIONS_PER_NODE = 10;
export const MAX_QUESTIONS_PER_NODE = 15;

export function getTargetQuestionCount(nodeId: string): number {
  let h = 0;
  for (let i = 0; i < nodeId.length; i++) {
    h = (h << 5) - h + nodeId.charCodeAt(i);
    h |= 0;
  }
  const range = MAX_QUESTIONS_PER_NODE - MIN_QUESTIONS_PER_NODE + 1;
  return MIN_QUESTIONS_PER_NODE + (Math.abs(h) % range);
}

/** @deprecated use getTargetQuestionCount */
export const EXERCISES_PER_NODE = MIN_QUESTIONS_PER_NODE;

export const VOICE_INTROS: Record<LevelExerciseType, string> = {
  listen_pick_word: "Listen to the word and choose the correct English word.",
  spell_word: "Listen and spell the correct English word.",
  listen_pick_sentence: "Listen to the sentence and choose the correct meaning.",
  listen_pick_line: "Listen to the dialogue and choose the correct translation.",
  situational_pick: "Read the situation and choose the best front desk expression.",
};

/** 屏幕显示用的中文说明 */
export const PROMPT_LABELS: Record<LevelExerciseType, string> = {
  listen_pick_word: "听发音，选择正确的单词",
  spell_word: "听发音，拼写出正确的英文单词",
  listen_pick_sentence: "听句子，选择正确的中文意思",
  listen_pick_line: "听对话，选择正确的中文翻译",
  situational_pick: "根据情景，选择最合适的前台表达",
};

/** 多邻国风格英文指令（屏幕顶部） */
export const DUOLINGO_INSTRUCTIONS: Record<LevelExerciseType, string> = {
  listen_pick_word: "Select the correct word",
  spell_word: "Write what you hear",
  listen_pick_sentence: "What does this mean?",
  listen_pick_line: "Select the correct translation",
  situational_pick: "Pick the best response",
};
