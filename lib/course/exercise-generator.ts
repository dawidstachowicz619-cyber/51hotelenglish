import type {
  DialogueItem,
  ScenarioItem,
  SentenceItem,
  WordItem,
  WorkScenarioLevel,
} from "@/lib/types/course";
import type { CourseModuleTab } from "@/lib/types/course";
import type { ProgressionNode } from "@/lib/types/course-progress";
import type { LevelExercise, LevelExerciseType } from "@/lib/types/level-exercise";
import {
  getTargetQuestionCount,
  PROMPT_LABELS,
  VOICE_INTROS,
} from "@/lib/types/level-exercise";
import { getDepartmentLevelSimulations } from "@/lib/data/front-desk/simulation-generator";

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickDistractors<T>(
  pool: T[],
  correct: T,
  count: number,
  getKey: (item: T) => string,
  seed: number
): T[] {
  const others = pool.filter((item) => getKey(item) !== getKey(correct));
  const result: T[] = [];
  const available = [...others];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = (seed + i * 7) % available.length;
    result.push(available[idx]);
    available.splice(idx, 1);
  }
  return result;
}

function shuffleOptions(options: string[], seed: number): string[] {
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildListenPickWord(
  word: WordItem,
  allWords: WordItem[],
  index: number,
  module: CourseModuleTab
): LevelExercise {
  const seed = hashSeed(word.id + String(index));
  const distractors = pickDistractors(allWords, word, 3, (w) => w.english, seed);
  const options = shuffleOptions(
    [word.english, ...distractors.map((d) => d.english)],
    seed
  );

  return {
    id: `lw-${word.id}-${index}`,
    type: "listen_pick_word",
    module,
    audioText: word.english,
    prompt: PROMPT_LABELS.listen_pick_word,
    voiceIntro: VOICE_INTROS.listen_pick_word,
    options,
    correctAnswer: word.english,
    explanation: `${word.english}，意思是${word.chinese}`,
  };
}

function buildSpellWord(
  word: WordItem,
  index: number,
  module: CourseModuleTab
): LevelExercise {
  return {
    id: `sw-${word.id}-${index}`,
    type: "spell_word",
    module,
    audioText: word.english,
    prompt: PROMPT_LABELS.spell_word,
    voiceIntro: VOICE_INTROS.spell_word,
    chineseHint: word.chinese,
    phoneticHint: word.phonetic,
    correctAnswer: word.english,
    explanation: `${word.english} ${word.phonetic}，${word.chinese}`,
  };
}

function buildListenPickSentence(
  sentence: SentenceItem,
  allSentences: SentenceItem[],
  index: number,
  module: CourseModuleTab
): LevelExercise {
  const seed = hashSeed(sentence.id + String(index));
  const distractors = pickDistractors(allSentences, sentence, 3, (s) => s.chinese, seed);
  const options = shuffleOptions(
    [sentence.chinese, ...distractors.map((d) => d.chinese)],
    seed
  );

  return {
    id: `ls-${sentence.id}-${index}`,
    type: "listen_pick_sentence",
    module,
    audioText: sentence.english,
    prompt: PROMPT_LABELS.listen_pick_sentence,
    voiceIntro: VOICE_INTROS.listen_pick_sentence,
    options,
    correctAnswer: sentence.chinese,
    explanation: `${sentence.english}。中文意思是：${sentence.chinese}`,
  };
}

function buildListenPickLine(
  line: { english: string; chinese: string },
  pool: { english: string; chinese: string }[],
  id: string,
  index: number,
  module: CourseModuleTab
): LevelExercise {
  const seed = hashSeed(id + String(index));
  const distractors = pickDistractors(pool, line, 3, (l) => l.chinese, seed);
  const options = shuffleOptions(
    [line.chinese, ...distractors.map((d) => d.chinese)],
    seed
  );

  return {
    id: `ll-${id}-${index}`,
    type: "listen_pick_line",
    module,
    audioText: line.english,
    prompt: PROMPT_LABELS.listen_pick_line,
    voiceIntro: VOICE_INTROS.listen_pick_line,
    options,
    correctAnswer: line.chinese,
    explanation: `${line.english}。意思是：${line.chinese}`,
  };
}

function collectLines(dialogues: DialogueItem[]) {
  const lines: { english: string; chinese: string; id: string }[] = [];
  for (const d of dialogues) {
    for (const line of d.lines) {
      lines.push({
        english: line.english,
        chinese: line.chinese,
        id: `${d.id}-${lines.length}`,
      });
    }
  }
  return lines;
}

function collectPhrases(scenarios: ScenarioItem[]) {
  const phrases: { english: string; chinese: string; scenarioTitle: string; id: string }[] =
    [];
  for (const s of scenarios) {
    s.keyPhrases.forEach((p, i) => {
      phrases.push({
        english: p.english,
        chinese: p.chinese,
        scenarioTitle: s.title,
        id: `${s.id}-kp-${i}`,
      });
    });
    s.sampleDialogue.forEach((p, i) => {
      if (p.speaker === "staff") {
        phrases.push({
          english: p.english,
          chinese: p.chinese,
          scenarioTitle: s.title,
          id: `${s.id}-sd-${i}`,
        });
      }
    });
  }
  return phrases;
}

function sentencePoolFromContent(content: WorkScenarioLevel): SentenceItem[] {
  const pool = [...content.sentences];
  for (const d of content.dialogues) {
    for (const line of d.lines) {
      pool.push({
        id: `dlg-${pool.length}`,
        english: line.english,
        chinese: line.chinese,
        context: "对话",
      });
    }
  }
  for (const s of content.scenarios) {
    for (const p of s.keyPhrases) {
      pool.push({
        id: `sc-${pool.length}`,
        english: p.english,
        chinese: p.chinese,
        context: s.title,
      });
    }
  }
  return pool;
}

function generateWordExercises(
  words: WordItem[],
  module: CourseModuleTab,
  nodeId: string,
  target: number
): LevelExercise[] {
  if (words.length === 0) return [];

  const exercises: LevelExercise[] = [];
  let i = 0;
  while (exercises.length < target) {
    const word = words[i % words.length];
    const round = Math.floor(i / words.length);
    const idx = round * words.length + (i % words.length);
    if (i % 2 === 0) {
      exercises.push(buildListenPickWord(word, words, idx, module));
    } else {
      exercises.push(buildSpellWord(word, idx, module));
    }
    i++;
  }
  return exercises.slice(0, target);
}

function generateSentenceExercises(
  content: WorkScenarioLevel,
  module: CourseModuleTab,
  target: number
): LevelExercise[] {
  const pool = sentencePoolFromContent(content);
  if (pool.length === 0) return [];

  const exercises: LevelExercise[] = [];
  for (let i = 0; i < target; i++) {
    const sentence = pool[i % pool.length];
    exercises.push(buildListenPickSentence(sentence, pool, i, module));
  }
  return exercises;
}

function generateDialogueExercises(
  content: WorkScenarioLevel,
  module: CourseModuleTab,
  target: number
): LevelExercise[] {
  const lines = collectLines(content.dialogues);
  const phraseLines = collectPhrases(content.scenarios).map((p) => ({
    english: p.english,
    chinese: p.chinese,
    id: p.id,
  }));
  const pool = [...lines, ...phraseLines];
  if (pool.length === 0) return [];

  const exercises: LevelExercise[] = [];
  for (let i = 0; i < target; i++) {
    const line = pool[i % pool.length];
    exercises.push(buildListenPickLine(line, pool, line.id, i, module));
  }
  return exercises;
}

function generateScenarioExercises(
  scenarios: ScenarioItem[],
  module: CourseModuleTab,
  target: number
): LevelExercise[] {
  const allPhrases = collectPhrases(scenarios);
  if (allPhrases.length === 0) return [];

  const exercises: LevelExercise[] = [];
  for (let i = 0; i < target; i++) {
    const phraseMeta = allPhrases[i % allPhrases.length];
    const seed = hashSeed(phraseMeta.id + String(i));
    const distractors = pickDistractors(
      allPhrases,
      phraseMeta,
      3,
      (p) => p.english,
      seed
    );
    const options = shuffleOptions(
      [phraseMeta.english, ...distractors.map((d) => d.english)],
      seed
    );

    exercises.push({
      id: `sp-${phraseMeta.id}-${i}`,
      type: "situational_pick",
      module,
      audioText: phraseMeta.english,
      prompt: `情景：${phraseMeta.scenarioTitle}。选择最合适的前台表达`,
      voiceIntro: VOICE_INTROS.situational_pick,
      options,
      correctAnswer: phraseMeta.english,
      explanation: `正确表达：${phraseMeta.english}。${phraseMeta.chinese}`,
    });
  }
  return exercises;
}

export function generateNodeExercises(
  node: ProgressionNode,
  content: WorkScenarioLevel
): LevelExercise[] {
  let target = getTargetQuestionCount(node.id);
  let exercises: LevelExercise[] = [];

  switch (node.module) {
    case "words":
      exercises = generateWordExercises(
        content.words,
        node.module,
        node.id,
        target
      );
      break;
    case "sentences":
      exercises = generateSentenceExercises(content, node.module, target);
      break;
    case "dialogues":
      exercises = generateDialogueExercises(content, node.module, target);
      break;
    case "scenario": {
      let scenarios = content?.scenarios ?? [];
      if (node.simulationId) {
        const deptSims = getDepartmentLevelSimulations(
          node.departmentId,
          node.cefrLevel
        );
        scenarios = deptSims.filter((s) => s.id === node.simulationId);
        if (scenarios.length === 0 && content) {
          scenarios = content.scenarios.filter(
            (s) => s.id === node.simulationId
          );
        }
      }
      target = node.simulationId ? Math.min(3, target) : target;
      exercises = generateScenarioExercises(scenarios, node.module, target);
      break;
    }
  }

  if (exercises.length === 0) {
    exercises = generateSentenceExercises(content, node.module, target);
  }

  return exercises.slice(0, target);
}

export function normalizeSpellAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/['']/g, "'");
}

export function isSpellCorrect(input: string, answer: string): boolean {
  return normalizeSpellAnswer(input) === normalizeSpellAnswer(answer);
}

export function getExerciseTypeForModule(
  module: CourseModuleTab
): LevelExerciseType[] {
  switch (module) {
    case "words":
      return ["listen_pick_word", "spell_word"];
    case "sentences":
      return ["listen_pick_sentence"];
    case "dialogues":
      return ["listen_pick_line"];
    case "scenario":
      return ["situational_pick"];
  }
}

export { getTargetQuestionCount };
