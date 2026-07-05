import type {
  CourseContentStore,
  ScenarioContentOverride,
  ScenarioMetaOverride,
  LevelContentOverride,
  SimulationContentOverride,
} from "@/lib/types/course-content-override";
import { COURSE_CONTENT_OVERRIDES_KEY } from "@/lib/types/course-content-override";
import type { CefrLevel } from "@/lib/types/course";
import { invalidateCourseContentCache } from "@/lib/course/course-content-resolver";

function loadStore(): CourseContentStore {
  if (typeof window === "undefined") return { scenarios: {} };
  try {
    const raw = localStorage.getItem(COURSE_CONTENT_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as CourseContentStore) : { scenarios: {} };
  } catch {
    return { scenarios: {} };
  }
}

function saveStore(store: CourseContentStore): void {
  if (typeof window === "undefined") return;
  store.updatedAt = new Date().toISOString();
  localStorage.setItem(COURSE_CONTENT_OVERRIDES_KEY, JSON.stringify(store));
  invalidateCourseContentCache();
  window.dispatchEvent(new Event("course-content-updated"));
}

function ensureScenario(
  store: CourseContentStore,
  scenarioId: string
): ScenarioContentOverride {
  if (!store.scenarios[scenarioId]) {
    store.scenarios[scenarioId] = { updatedAt: new Date().toISOString() };
  }
  return store.scenarios[scenarioId];
}

export function getCourseContentStore(): CourseContentStore {
  return loadStore();
}

export function getScenarioOverride(
  scenarioId: string
): ScenarioContentOverride | undefined {
  return loadStore().scenarios[scenarioId];
}

export function saveScenarioMeta(
  scenarioId: string,
  meta: ScenarioMetaOverride
): void {
  const store = loadStore();
  const entry = ensureScenario(store, scenarioId);
  entry.meta = meta;
  entry.updatedAt = new Date().toISOString();
  saveStore(store);
}

export function saveLevelContentOverride(
  scenarioId: string,
  level: CefrLevel,
  content: LevelContentOverride
): void {
  const store = loadStore();
  const entry = ensureScenario(store, scenarioId);
  entry.levels = entry.levels ?? {};
  entry.levels[level] = content;
  entry.updatedAt = new Date().toISOString();
  saveStore(store);
}

export function saveSimulationOverride(
  simulationId: string,
  scenarioId: string,
  patch: SimulationContentOverride
): void {
  const store = loadStore();
  const entry = ensureScenario(store, scenarioId);
  entry.simulations = entry.simulations ?? {};
  entry.simulations[simulationId] = {
    ...entry.simulations[simulationId],
    ...patch,
  };
  entry.updatedAt = new Date().toISOString();
  saveStore(store);
}

export function resetScenarioOverride(scenarioId: string): void {
  const store = loadStore();
  delete store.scenarios[scenarioId];
  saveStore(store);
}

export function resetSimulationOverride(
  scenarioId: string,
  simulationId: string
): void {
  const store = loadStore();
  const entry = store.scenarios[scenarioId];
  if (!entry?.simulations) return;
  delete entry.simulations[simulationId];
  if (Object.keys(entry.simulations).length === 0) delete entry.simulations;
  if (
    !entry.meta &&
    !entry.levels &&
    !entry.simulations
  ) {
    delete store.scenarios[scenarioId];
  }
  saveStore(store);
}

export function hasScenarioOverride(scenarioId: string): boolean {
  return Boolean(loadStore().scenarios[scenarioId]);
}

export function getSimulationOverridesForScenario(
  scenarioId: string
): Record<string, SimulationContentOverride> {
  return loadStore().scenarios[scenarioId]?.simulations ?? {};
}

export function applySimulationPatch(
  simulation: import("@/lib/types/course").ScenarioItem,
  override?: SimulationContentOverride
) {
  if (!override) return simulation;
  return {
    ...simulation,
    ...override,
    objectives: override.objectives ?? simulation.objectives,
    keyPhrases: override.keyPhrases ?? simulation.keyPhrases,
    sampleDialogue: override.sampleDialogue ?? simulation.sampleDialogue,
  };
}
