import mammoth from "mammoth";

import type {
  HrTrainingModule,
  SupportedDocExtension,
  TrainingQuestion,
  TrainingSlide,
} from "@/lib/types/hr-training";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { AskDimension, LearningPhase } from "@/lib/types/learning-record";

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = extOf(file.name) as SupportedDocExtension | string;

  if (ext === ".txt" || ext === ".md") {
    return file.text();
  }

  if (ext === ".docx") {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }

  throw new Error("暂支持 TXT、Markdown、Word（.docx）格式");
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 12);
}

function chunkParagraphs(paragraphs: string[], maxLen = 380): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const p of paragraphs) {
    if (current.length + p.length + 1 <= maxLen) {
      current = current ? `${current}\n${p}` : p;
    } else {
      if (current) chunks.push(current);
      if (p.length <= maxLen) {
        current = p;
      } else {
        const sentences = p.split(/(?<=[。！？.!?])\s*/);
        let buf = "";
        for (const s of sentences) {
          if (buf.length + s.length <= maxLen) buf += s;
          else {
            if (buf) chunks.push(buf.trim());
            buf = s;
          }
        }
        current = buf;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function titleFromChunk(chunk: string, index: number): string {
  const firstLine = chunk.split("\n")[0] ?? chunk;
  const sentence = firstLine.split(/[。！？.!?]/)[0]?.trim() ?? firstLine;
  if (sentence.length >= 4 && sentence.length <= 28) return sentence;
  return `培训内容 ${index + 1}`;
}

function bulletsFromChunk(chunk: string): string[] {
  const lines = chunk
    .split(/\n/)
    .map((l) => l.replace(/^[-*•\d.)\]]+\s*/, "").trim())
    .filter((l) => l.length >= 4);
  if (lines.length >= 2) return lines.slice(0, 5);
  const sentences = chunk
    .split(/(?<=[。！？.!?])\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6);
  return sentences.slice(0, 4);
}

function estimateDuration(text: string): number {
  const chars = text.replace(/\s/g, "").length;
  return Math.max(15, Math.min(90, Math.round(chars / 4)));
}

export function buildSlidesFromText(text: string): TrainingSlide[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  const paragraphs = splitParagraphs(cleaned);
  const chunks =
    paragraphs.length > 0 ? chunkParagraphs(paragraphs) : chunkParagraphs([cleaned]);
  if (chunks.length === 0) {
    return [
      {
        id: "slide-1",
        order: 1,
        title: "培训内容",
        narration: cleaned.slice(0, 380),
        bullets: [],
        durationSec: estimateDuration(cleaned),
      },
    ];
  }

  return chunks.map((chunk, index) => ({
    id: `slide-${index + 1}`,
    order: index + 1,
    title: titleFromChunk(chunk, index),
    narration: chunk,
    bullets: bulletsFromChunk(chunk),
    durationSec: estimateDuration(chunk),
  }));
}

function pickDistractors(pool: string[], correct: string, count: number, seed: number): string[] {
  const others = [...new Set(pool.filter((s) => s !== correct && s.length >= 4))];
  const result: string[] = [];
  for (let i = 0; i < count && others.length > 0; i++) {
    const idx = (seed + i * 7) % others.length;
    result.push(others[idx]);
    others.splice(idx, 1);
  }
  return result;
}

export function buildQuestionsFromSlides(slides: TrainingSlide[]): TrainingQuestion[] {
  const questions: TrainingQuestion[] = [];
  const allSentences = slides.flatMap((s) =>
    s.narration
      .split(/(?<=[。！？.!?])\s*/)
      .map((x) => x.trim())
      .filter((x) => x.length >= 12 && x.length <= 120)
  );

  for (let i = 0; i < slides.length && questions.length < 8; i++) {
    const slide = slides[i];
    const candidates = slide.narration
      .split(/(?<=[。！？.!?])\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 12 && s.length <= 100);
    if (candidates.length === 0) continue;

    const correct = candidates[0].endsWith("。") ? candidates[0] : `${candidates[0]}。`;
    const distractors = pickDistractors(allSentences, correct, 3, i * 13 + correct.length);
    if (distractors.length < 2) continue;

    const options = shuffle([correct, ...distractors.slice(0, 3)], i);

    questions.push({
      id: `q-${slide.id}`,
      prompt: `（${slide.title}）以下哪项表述与培训内容一致？`,
      options,
      correctAnswer: correct,
      explanation: `正确内容来自本课「${slide.title}」：${correct}`,
    });
  }

  if (questions.length === 0 && slides.length > 0) {
    const slide = slides[0];
    questions.push({
      id: "q-fallback",
      prompt: `本培训的核心主题是什么？`,
      options: shuffle(
        [
          slide.title,
          "与培训无关的后勤安排",
          "个人休假申请流程",
          "财务报销制度",
        ],
        1
      ),
      correctAnswer: slide.title,
      explanation: `本课程主题：${slide.title}`,
    });
  }

  return questions.slice(0, 6);
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type ProcessDocumentInput = {
  hotel: string;
  file: File;
  title?: string;
  department: EmployeeDepartment | "all";
  phase: LearningPhase;
  ask: AskDimension;
};

export async function processDocumentToModule(
  input: ProcessDocumentInput
): Promise<HrTrainingModule> {
  const text = await extractTextFromFile(input.file);
  if (text.length < 20) {
    throw new Error("文档内容过短，请上传至少一段完整培训文字");
  }

  const slides = buildSlidesFromText(text);
  const questions = buildQuestionsFromSlides(slides);
  const baseTitle =
    input.title?.trim() ||
    input.file.name.replace(/\.[^.]+$/, "") ||
    "酒店培训课程";

  return {
    id: `training-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    hotel: input.hotel,
    title: baseTitle,
    fileName: input.file.name,
    uploadedAt: new Date().toISOString(),
    department: input.department,
    phase: input.phase,
    ask: input.ask,
    slides,
    questions,
    slideCount: slides.length,
    questionCount: questions.length,
  };
}

/** 预估视频总时长 */
export function totalVideoDurationSec(module: HrTrainingModule): number {
  return module.slides.reduce((sum, s) => sum + s.durationSec, 0);
}
