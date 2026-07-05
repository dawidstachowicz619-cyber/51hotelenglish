import {
  applySimulationPatch,
  getCourseContentStore,
} from "@/lib/course/course-content-overrides";
import {
  getPublishedGeneratedCourses,
} from "@/lib/course/generated-course-storage";
import { generatedCourseToWorkScenario } from "@/lib/course/course-theme-generator";
import {
  attachSimulations,
  invalidateSimulationCache,
} from "@/lib/data/front-desk/simulation-generator";
import { getBaseFrontDeskScenarios } from "@/lib/data/front-desk";
import type { WorkScenario } from "@/lib/types/course";

let resolvedCache: WorkScenario[] | null = null;

function mergeScenarioWithOverrides(
  base: WorkScenario,
  override?: import("@/lib/types/course-content-override").ScenarioContentOverride
): WorkScenario {
  if (!override) return base;
  return {
    ...base,
    title: override.meta?.title ?? base.title,
    subtitle: override.meta?.subtitle ?? base.subtitle,
    description: override.meta?.description ?? base.description,
    levels: base.levels.map((levelContent) => {
      const levelOverride = override.levels?.[levelContent.level];
      if (!levelOverride) return levelContent;
      return {
        ...levelContent,
        words: levelOverride.words ?? levelContent.words,
        sentences: levelOverride.sentences ?? levelContent.sentences,
        dialogues: levelOverride.dialogues ?? levelContent.dialogues,
      };
    }),
  };
}

export function invalidateCourseContentCache(): void {
  resolvedCache = null;
  invalidateSimulationCache();
}

/** 合并平台管理员自定义内容后的前厅课程数据 */
export function getFrontDeskWorkScenarios(): WorkScenario[] {
  if (typeof window === "undefined") {
    return attachSimulations(getBaseFrontDeskScenarios());
  }

  if (resolvedCache) return resolvedCache;

  const store = getCourseContentStore();
  const merged = getBaseFrontDeskScenarios().map((scenario) =>
    mergeScenarioWithOverrides(scenario, store.scenarios[scenario.id])
  );

  const generated = getPublishedGeneratedCourses().map(generatedCourseToWorkScenario);
  resolvedCache = attachSimulations([...merged, ...generated]);
  return resolvedCache;
}

if (typeof window !== "undefined") {
  window.addEventListener("generated-courses-updated", () => {
    resolvedCache = null;
    invalidateSimulationCache();
  });
}
