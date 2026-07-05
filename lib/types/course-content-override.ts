import type {
  CefrLevel,
  DialogueItem,
  ScenarioItem,
  SentenceItem,
  WordItem,
} from "@/lib/types/course";

export type ScenarioMetaOverride = {
  title?: string;
  subtitle?: string;
  description?: string;
};

export type LevelContentOverride = {
  words?: WordItem[];
  sentences?: SentenceItem[];
  dialogues?: DialogueItem[];
};

export type SimulationContentOverride = Partial<
  Pick<
    ScenarioItem,
    | "title"
    | "setting"
    | "description"
    | "objectives"
    | "keyPhrases"
    | "sampleDialogue"
  >
>;

export type ScenarioContentOverride = {
  meta?: ScenarioMetaOverride;
  levels?: Partial<Record<CefrLevel, LevelContentOverride>>;
  /** key = simulation id, e.g. sim-concierge-A2-special-requests-1 */
  simulations?: Record<string, SimulationContentOverride>;
  updatedAt?: string;
};

export type CourseContentStore = {
  scenarios: Record<string, ScenarioContentOverride>;
  updatedAt?: string;
};

export const COURSE_CONTENT_OVERRIDES_KEY = "51he-course-content-overrides";
