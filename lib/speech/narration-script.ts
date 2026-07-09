import type { TrainingSlideSection } from "@/lib/types/hr-training";

const SECTION_OPENERS: Record<TrainingSlideSection, string> = {
  objective: "首先，我们来看本课的学习目标。",
  knowledge: "接下来，进入知识点讲解。",
  case: "最后，结合一个实际案例来应用所学。",
};

/** 规范化文本，便于 TTS 断句与停顿 */
export function normalizeForTts(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, "")
    .replace(/\n+/g, "，")
    .replace(/[;；]/g, "，")
    .replace(/[:：]/g, "，")
    .replace(/[—–-]{2,}/g, "，")
    .replace(/([，,])\1+/g, "，")
    .replace(/([。！？])\1+/g, "$1")
    .replace(/，([。！？])/g, "$1")
    .trim();
}

/** 为讲解稿添加阶段引导语，使配音更像真人授课 */
export function enrichNarrationForSpeech(
  narration: string,
  opts?: {
    section?: TrainingSlideSection;
    isFirstInSection?: boolean;
    courseTitle?: string;
  }
): string {
  let text = normalizeForTts(narration);
  if (!text) return text;

  if (opts?.isFirstInSection && opts.section) {
    const opener = SECTION_OPENERS[opts.section];
    if (!text.startsWith(opener.slice(0, 6))) {
      text = `${opener}${text}`;
    }
  }

  if (opts?.section === "objective" && opts.courseTitle && !text.includes("欢迎")) {
    text = text.replace(/^首先/, `首先，欢迎学习「${opts.courseTitle}」。`);
  }

  return text;
}

/** 判断是否为阶段引导句（需更长停顿） */
export function isSectionOpenerSentence(sentence: string): boolean {
  return Object.values(SECTION_OPENERS).some((opener) => sentence.startsWith(opener.slice(0, 8)));
}
