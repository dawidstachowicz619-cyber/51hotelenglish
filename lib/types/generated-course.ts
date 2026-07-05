import type {
  CefrLevel,
  DialogueItem,
  ScenarioItem,
  SentenceItem,
  WordItem,
} from "@/lib/types/course";
import type { FrontDeskDepartmentId } from "@/lib/types/front-desk-department";

export type GeneratedLevelContent = {
  words: WordItem[];
  sentences: SentenceItem[];
  dialogues: DialogueItem[];
  simulations: ScenarioItem[];
};

export type GeneratedCoursePackage = {
  id: string;
  /** 对应 WorkScenario.id，格式 gen-{id} */
  scenarioId: string;
  departmentId: FrontDeskDepartmentId;
  /** 管理员输入的主题 */
  theme: string;
  title: string;
  subtitle: string;
  description: string;
  /** 生成时选定的主级别；该级别内容最完整 */
  primaryLevel: CefrLevel;
  levels: Partial<Record<CefrLevel, GeneratedLevelContent>>;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};

export const GENERATED_COURSES_KEY = "51he-generated-courses";

export const GENERATED_SIMULATIONS_COUNT = 12;
