import mammoth from "mammoth";

import {
  buildDefaultVideoQuestions,
} from "@/lib/course/management-theme-generator";
import { extractSlideTextsFromPptx } from "@/lib/hr/pptx-extractor";
import {
  buildStructuredSlidesFromPptxSlides,
  buildStructuredSlidesFromText,
} from "@/lib/hr/slide-structure";
import {
  isVideoFile,
  saveTrainingVideo,
} from "@/lib/hr/training-video-storage";
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

  if (ext === ".pptx") {
    const slides = await extractSlideTextsFromPptx(file);
    return slides.join("\n\n");
  }

  if (ext === ".ppt") {
    throw new Error("暂不支持旧版 .ppt 格式，请另存为 .pptx 后上传");
  }

  throw new Error("暂支持 PPT（.pptx）、Word（.docx）、TXT、Markdown 格式");
}

export function buildSlidesFromText(text: string, courseTitle?: string): TrainingSlide[] {
  return buildStructuredSlidesFromText(text, courseTitle);
}

/** PPT 每页幻灯片对应一节视频课（按三阶段结构组织） */
export function buildSlidesFromPptxSlides(
  slideTexts: string[],
  courseTitle?: string
): TrainingSlide[] {
  return buildStructuredSlidesFromPptxSlides(slideTexts, courseTitle);
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
  const ext = extOf(input.file.name);
  let slides: TrainingSlide[];

  if (ext === ".pptx") {
    const slideTexts = await extractSlideTextsFromPptx(input.file);
    const baseTitle =
      input.title?.trim() ||
      input.file.name.replace(/\.[^.]+$/, "") ||
      "酒店培训课程";
    slides = buildSlidesFromPptxSlides(slideTexts, baseTitle);
  } else {
    const text = await extractTextFromFile(input.file);
    if (text.length < 20) {
      throw new Error("文档内容过短，请上传至少一段完整培训文字");
    }
    const baseTitle =
      input.title?.trim() ||
      input.file.name.replace(/\.[^.]+$/, "") ||
      "酒店培训课程";
    slides = buildSlidesFromText(text, baseTitle);
  }

  if (slides.length === 0) {
    throw new Error("未能从文档中生成课程内容，请检查文件是否包含培训文字");
  }

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
    deliveryType: "slides",
    slides,
    questions,
    slideCount: slides.length,
    questionCount: questions.length,
  };
}

export type ProcessVideoInput = {
  hotel: string;
  file: File;
  title?: string;
  department: EmployeeDepartment | "all";
  phase: LearningPhase;
  ask: AskDimension;
  source?: HrTrainingModule["source"];
};

export async function processVideoToModule(
  input: ProcessVideoInput
): Promise<HrTrainingModule> {
  if (!isVideoFile(input.file.name)) {
    throw new Error("请上传 MP4、WebM 或 MOV 格式视频");
  }

  const id = `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const videoRef = await saveTrainingVideo(id, input.file);
  const baseTitle =
    input.title?.trim() ||
    input.file.name.replace(/\.[^.]+$/, "") ||
    "视频培训课程";

  const slides: TrainingSlide[] = [
    {
      id: "slide-1",
      order: 1,
      title: baseTitle,
      narration: `本课为视频培训：${baseTitle}。请完整观看视频后完成课后测验。`,
      bullets: ["完整观看视频", "注意关键管理要点", "完成后进行测验"],
      durationSec: 60,
    },
  ];

  const questions = buildDefaultVideoQuestions(baseTitle);

  return {
    id,
    hotel: input.hotel,
    title: baseTitle,
    fileName: input.file.name,
    uploadedAt: new Date().toISOString(),
    department: input.department,
    phase: input.phase,
    ask: input.ask,
    deliveryType: "video",
    videoUrl: videoRef,
    source: input.source,
    slides,
    questions,
    slideCount: 1,
    questionCount: questions.length,
  };
}

/** 预估视频总时长 */
export function totalVideoDurationSec(module: HrTrainingModule): number {
  return module.slides.reduce((sum, s) => sum + s.durationSec, 0);
}
