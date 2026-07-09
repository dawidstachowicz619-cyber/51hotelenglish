import type {
  HrTrainingModule,
  TrainingQuestion,
  TrainingSlide,
  TrainingSlideSection,
} from "@/lib/types/hr-training";
import type { AskDimension } from "@/lib/types/learning-record";
import { buildQuestionsFromSlides } from "@/lib/hr/document-processor";
import { enrichNarrationForSpeech } from "@/lib/speech/narration-script";
import type { TrainingSlideIllustration } from "@/lib/types/training-slide-illustration";

export type GenerateManagementCourseInput = {
  theme: string;
  brief?: string;
  ask?: AskDimension;
};

function estimateDuration(text: string): number {
  const chars = text.replace(/\s/g, "").length;
  return Math.max(18, Math.min(90, Math.round(chars / 3.2)));
}

function buildManagementSlides(theme: string, brief?: string): TrainingSlide[] {
  const focus = brief?.trim() || `围绕「${theme}」的管理实践与团队落地`;

  const blocks: Array<{
    section: TrainingSlideSection;
    title: string;
    narration: string;
    bullets: string[];
    illustration: TrainingSlideIllustration;
  }> = [
    {
      section: "objective",
      illustration: "course-objective",
      title: "课程目标",
      narration: `通过本课，您将掌握「${theme}」的核心管理价值，理解关键执行动作，并能在真实工作场景中正确应用。${focus}。`,
      bullets: [
        "明确主题对团队与宾客的价值",
        "掌握可执行的管理动作",
        "能在案例中正确应用所学",
      ],
    },
    {
      section: "knowledge",
      illustration: "course-knowledge",
      title: "知识点讲解",
      narration: `在「${theme}」场景中，管理者需要完成三件事：第一，设定清晰期望与可衡量目标；第二，分配资源并跟进执行；第三，及时反馈与复盘。遇到跨部门协作时，主动拉通前台、客房、餐饮等同事，避免信息断层。`,
      bullets: [
        "设定清晰期望与可衡量目标",
        "分配资源、跟进执行进度",
        "跨部门拉通，避免信息断层",
      ],
    },
    {
      section: "knowledge",
      illustration: "coaching",
      title: "知识点讲解 · 2",
      narration: `面对一线伙伴执行不到位的情况，采用 SBI 反馈：描述情境、具体行为与影响，共同制定改进行动。将品牌服务标准转化为可执行的行为规范，并在班前会、现场辅导中反复强化。`,
      bullets: [
        "SBI 反馈：情境 · 行为 · 影响",
        "将标准转化为可执行动作",
        "班前会与现场辅导中持续强化",
      ],
    },
    {
      section: "case",
      illustration: "course-case",
      title: "案例应用",
      narration: `案例：晚高峰时段，前台同事在处理「${theme}」相关事务时出现疏漏，宾客情绪上升。作为值班经理，您需要先安抚宾客、了解诉求，再协调相关部门快速补救，并在班后带团队复盘：记录优秀做法与改进点，更新 SOP 或检查清单。`,
      bullets: [
        "先安抚宾客、了解真实诉求",
        "协调跨部门快速补救",
        "班后复盘并更新 SOP",
      ],
    },
  ];

  const sectionFirstSeen: Partial<Record<TrainingSlideSection, boolean>> = {};

  return blocks.map((block, index) => {
    const isFirstInSection = !sectionFirstSeen[block.section];
    sectionFirstSeen[block.section] = true;

    const narration = enrichNarrationForSpeech(block.narration, {
      section: block.section,
      isFirstInSection,
      courseTitle: theme,
    });

    return {
      id: `slide-${index + 1}`,
      order: index + 1,
      section: block.section,
      title: block.title,
      narration,
      bullets: block.bullets,
      illustration: block.illustration,
      durationSec: estimateDuration(narration),
    };
  });
}

export function generateManagementCourseFromTheme(
  input: GenerateManagementCourseInput
): HrTrainingModule {
  const theme = input.theme.trim();
  const id = `mgmt-gen-${Date.now().toString(36)}`;
  const slides = buildManagementSlides(theme, input.brief);
  const questions = buildQuestionsFromSlides(slides);
  const now = new Date().toISOString();

  return {
    id,
    hotel: "platform",
    title: theme,
    fileName: `${theme}.generated`,
    uploadedAt: now,
    department: "all",
    phase: "management",
    ask: input.ask ?? "skill",
    deliveryType: "slides",
    source: "platform",
    slides,
    questions,
    slideCount: slides.length,
    questionCount: questions.length,
  };
}

/** 视频课默认配套测验 */
export function buildDefaultVideoQuestions(title: string): TrainingQuestion[] {
  return [
    {
      id: "vq-1",
      prompt: `观看「${title}」后，本课最核心的管理要点是？`,
      options: [
        "将标准转化为可执行的团队行动",
        "减少与团队沟通",
        "仅关注个人绩效",
        "避免现场辅导",
      ],
      correctAnswer: "将标准转化为可执行的团队行动",
      explanation: "管理培训强调把标准落地到团队日常行动中。",
    },
    {
      id: "vq-2",
      prompt: "管理者遇到跨部门协作问题时应？",
      options: [
        "主动拉通相关部门，避免信息断层",
        "等待其他部门主动联系",
        "只在本部门内部处理",
        "推迟到季度再解决",
      ],
      correctAnswer: "主动拉通相关部门，避免信息断层",
      explanation: "酒店管理需要主动跨部门协调。",
    },
  ];
}
