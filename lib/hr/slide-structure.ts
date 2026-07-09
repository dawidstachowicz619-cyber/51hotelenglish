import {
  illustrationForSection,
  illustrationForSlideIndex,
} from "@/lib/types/training-slide-illustration";
import type { TrainingSlide, TrainingSlideSection } from "@/lib/types/hr-training";
import { enrichNarrationForSpeech } from "@/lib/speech/narration-script";

export const SLIDE_SECTION_LABELS: Record<TrainingSlideSection, string> = {
  objective: "课程目标",
  knowledge: "知识点讲解",
  case: "案例应用",
};

function pickIllustration(section: TrainingSlideSection, indexInSection: number) {
  return illustrationForSection(section, indexInSection);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[。！？.!?])\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 8);
}

function isCaseParagraph(text: string): boolean {
  return /案例|示例|情景|场景|例如|比如|实操|演练|应用|客人|宾客|投诉|处理/.test(text);
}

function isObjectiveParagraph(text: string): boolean {
  return /目标|目的|学完|掌握|了解|认识|本课|学习后|完成后/.test(text);
}

function chunkText(text: string, maxLen = 360): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = splitSentences(text);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length <= maxLen) {
      current += sentence;
    } else {
      if (current) chunks.push(current.trim());
      current = sentence.length <= maxLen ? sentence : sentence.slice(0, maxLen);
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

function bulletsFromText(text: string): string[] {
  const lines = text
    .split(/\n/)
    .map((l) => l.replace(/^[-*•\d.)\]]+\s*/, "").trim())
    .filter((l) => l.length >= 4);
  if (lines.length >= 2) return lines.slice(0, 5);

  const sentences = splitSentences(text).filter((s) => s.length >= 6 && s.length <= 48);
  return sentences.slice(0, 4);
}

function estimateDuration(text: string): number {
  const chars = text.replace(/\s/g, "").length;
  return Math.max(18, Math.min(90, Math.round(chars / 3.2)));
}

function synthesizeObjective(source: string, courseTitle?: string): string {
  const topic = courseTitle?.trim() || "本培训课程";
  const summary = splitSentences(source).slice(0, 3).join("");
  return `欢迎学习「${topic}」。通过本课，您将明确以下学习目标：${summary || "掌握核心知识与实操要点，并能在工作中正确应用。"}`;
}

function synthesizeCase(source: string, courseTitle?: string): string {
  const topic = courseTitle?.trim() || "本课内容";
  if (isCaseParagraph(source)) return source;
  return `下面结合酒店实际工作场景，应用「${topic}」所学要点：${source}。请思考：遇到类似情况时，您会如何处理？`;
}

type SectionBuckets = Record<TrainingSlideSection, string[]>;

function distributeParagraphs(paragraphs: string[], courseTitle?: string): SectionBuckets {
  const buckets: SectionBuckets = { objective: [], knowledge: [], case: [] };

  if (paragraphs.length === 0) return buckets;

  const tagged = paragraphs.map((text) => ({
    text,
    objective: isObjectiveParagraph(text),
    case: isCaseParagraph(text),
  }));

  const explicitObjective = tagged.filter((t) => t.objective && !t.case);
  const explicitCase = tagged.filter((t) => t.case);
  const neutral = tagged.filter((t) => !t.objective && !t.case);

  if (explicitObjective.length > 0 || explicitCase.length > 0) {
    buckets.objective.push(
      ...(explicitObjective.length > 0
        ? explicitObjective.map((t) => t.text)
        : [synthesizeObjective(paragraphs[0], courseTitle)])
    );
    buckets.case.push(
      ...(explicitCase.length > 0
        ? explicitCase.map((t) => t.text)
        : [synthesizeCase(paragraphs[paragraphs.length - 1], courseTitle)])
    );
    const caseSet = new Set(explicitCase.map((t) => t.text));
    const objectiveSet = new Set(explicitObjective.map((t) => t.text));
    const knowledge = [
      ...neutral.map((t) => t.text),
      ...tagged
        .filter((t) => !caseSet.has(t.text) && !objectiveSet.has(t.text) && t.case)
        .map((t) => t.text),
    ];
    buckets.knowledge.push(...(knowledge.length > 0 ? knowledge : paragraphs.slice(1, -1)));
    if (buckets.knowledge.length === 0 && paragraphs.length > 1) {
      buckets.knowledge.push(paragraphs[Math.min(1, paragraphs.length - 1)]);
    }
    return buckets;
  }

  if (paragraphs.length === 1) {
    const sentences = splitSentences(paragraphs[0]);
    if (sentences.length >= 3) {
      const third = Math.max(1, Math.ceil(sentences.length / 3));
      buckets.objective.push(synthesizeObjective(sentences.slice(0, third).join(""), courseTitle));
      buckets.knowledge.push(sentences.slice(third, third * 2).join(""));
      buckets.case.push(
        synthesizeCase(sentences.slice(third * 2).join("") || paragraphs[0], courseTitle)
      );
    } else {
      buckets.objective.push(synthesizeObjective(paragraphs[0], courseTitle));
      buckets.knowledge.push(paragraphs[0]);
      buckets.case.push(synthesizeCase(paragraphs[0], courseTitle));
    }
    return buckets;
  }

  if (paragraphs.length === 2) {
    buckets.objective.push(synthesizeObjective(paragraphs[0], courseTitle));
    buckets.knowledge.push(paragraphs[0]);
    buckets.case.push(synthesizeCase(paragraphs[1], courseTitle));
    return buckets;
  }

  buckets.objective.push(synthesizeObjective(paragraphs[0], courseTitle));
  buckets.knowledge.push(...paragraphs.slice(1, -1));
  buckets.case.push(synthesizeCase(paragraphs[paragraphs.length - 1], courseTitle));
  return buckets;
}

function distributeSlideTexts(slideTexts: string[], courseTitle?: string): SectionBuckets {
  const paragraphs = slideTexts.map((t) => t.trim()).filter((t) => t.length >= 2);
  if (paragraphs.length <= 3) {
    return distributeParagraphs(paragraphs, courseTitle);
  }

  const cutObjective = Math.max(1, Math.round(paragraphs.length * 0.2));
  const cutCase = Math.max(1, Math.round(paragraphs.length * 0.2));
  const knowledgeStart = cutObjective;
  const knowledgeEnd = paragraphs.length - cutCase;

  return {
    objective: [synthesizeObjective(paragraphs.slice(0, cutObjective).join("\n"), courseTitle)],
    knowledge: paragraphs.slice(knowledgeStart, Math.max(knowledgeStart + 1, knowledgeEnd)),
    case: [
      synthesizeCase(paragraphs.slice(-cutCase).join("\n"), courseTitle),
    ],
  };
}

function sectionTitle(section: TrainingSlideSection, indexInSection: number): string {
  const label = SLIDE_SECTION_LABELS[section];
  if (section === "knowledge" && indexInSection > 0) {
    return `${label} · ${indexInSection + 1}`;
  }
  return label;
}

function buildSlidesFromBuckets(
  buckets: SectionBuckets,
  courseTitle?: string
): TrainingSlide[] {
  const order: TrainingSlideSection[] = ["objective", "knowledge", "case"];
  const slides: TrainingSlide[] = [];
  let orderIndex = 0;
  const sectionFirstSeen: Partial<Record<TrainingSlideSection, boolean>> = {};

  for (const section of order) {
    const texts = buckets[section];
    if (texts.length === 0) continue;

    const chunks = texts.flatMap((text) => chunkText(text));
    chunks.forEach((chunk, indexInSection) => {
      const isFirstInSection = !sectionFirstSeen[section];
      sectionFirstSeen[section] = true;

      const narration = enrichNarrationForSpeech(chunk, {
        section,
        isFirstInSection,
        courseTitle,
      });

      slides.push({
        id: `slide-${orderIndex + 1}`,
        order: orderIndex + 1,
        section,
        title: sectionTitle(section, indexInSection),
        narration,
        bullets: bulletsFromText(chunk),
        illustration: pickIllustration(section, indexInSection),
        durationSec: estimateDuration(narration),
      });
      orderIndex += 1;
    });
  }

  return slides;
}

/** 将文档正文组织为「课程目标 → 知识点讲解 → 案例应用」三节讲解 */
export function buildStructuredSlidesFromText(
  text: string,
  courseTitle?: string
): TrainingSlide[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  const paragraphs = splitParagraphs(cleaned);
  const buckets =
    paragraphs.length > 0
      ? distributeParagraphs(paragraphs, courseTitle)
      : distributeParagraphs([cleaned], courseTitle);

  const slides = buildSlidesFromBuckets(buckets, courseTitle);
  if (slides.length > 0) return slides;

  return [
    {
      id: "slide-1",
      order: 1,
      section: "objective",
      title: SLIDE_SECTION_LABELS.objective,
      narration: enrichNarrationForSpeech(
        synthesizeObjective(cleaned.slice(0, 380), courseTitle),
        { section: "objective", isFirstInSection: true, courseTitle }
      ),
      bullets: bulletsFromText(cleaned),
      illustration: illustrationForSection("objective"),
      durationSec: estimateDuration(cleaned),
    },
  ];
}

/** PPT 各页文本按三阶段结构生成讲解课 */
export function buildStructuredSlidesFromPptxSlides(
  slideTexts: string[],
  courseTitle?: string
): TrainingSlide[] {
  const nonEmpty = slideTexts.map((t) => t.trim()).filter((t) => t.length >= 2);
  if (nonEmpty.length === 0) return [];

  const buckets = distributeSlideTexts(nonEmpty, courseTitle);
  return buildSlidesFromBuckets(buckets, courseTitle);
}
