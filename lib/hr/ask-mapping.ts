import type { CourseModuleTab } from "@/lib/types/course";
import type { AskDimension } from "@/lib/types/learning-record";

/** 课程模块 → ASK 维度 */
export function moduleToAsk(module: CourseModuleTab): AskDimension {
  switch (module) {
    case "words":
    case "sentences":
      return "knowledge";
    case "dialogues":
      return "skill";
    case "scenario":
      return "skill";
    default:
      return "knowledge";
  }
}

/** 模拟场景同时体现服务态度 */
export function moduleAskTags(module: CourseModuleTab): AskDimension[] {
  if (module === "scenario") return ["skill", "attitude"];
  return [moduleToAsk(module)];
}

export function assessmentToAsk(): AskDimension[] {
  return ["knowledge", "skill"];
}
