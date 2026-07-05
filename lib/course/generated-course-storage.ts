import type { CefrLevel } from "@/lib/types/course";
import type {
  GeneratedCoursePackage,
  GeneratedLevelContent,
} from "@/lib/types/generated-course";
import { GENERATED_COURSES_KEY } from "@/lib/types/generated-course";

function loadAll(): GeneratedCoursePackage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GENERATED_COURSES_KEY);
    return raw ? (JSON.parse(raw) as GeneratedCoursePackage[]) : [];
  } catch {
    return [];
  }
}

function saveAll(courses: GeneratedCoursePackage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GENERATED_COURSES_KEY, JSON.stringify(courses));
  window.dispatchEvent(new Event("generated-courses-updated"));
  window.dispatchEvent(new Event("course-content-updated"));
}

export function getAllGeneratedCourses(): GeneratedCoursePackage[] {
  return loadAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getPublishedGeneratedCourses(): GeneratedCoursePackage[] {
  return getAllGeneratedCourses().filter((c) => c.status === "published");
}

export function getGeneratedCourseById(id: string): GeneratedCoursePackage | undefined {
  return loadAll().find((c) => c.id === id);
}

export function getGeneratedCourseByScenarioId(
  scenarioId: string
): GeneratedCoursePackage | undefined {
  return loadAll().find((c) => c.scenarioId === scenarioId);
}

export function saveGeneratedCourse(course: GeneratedCoursePackage): void {
  const list = loadAll();
  const index = list.findIndex((c) => c.id === course.id);
  const next = { ...course, updatedAt: new Date().toISOString() };
  if (index >= 0) list[index] = next;
  else list.push(next);
  saveAll(list);
}

export function deleteGeneratedCourse(id: string): void {
  saveAll(loadAll().filter((c) => c.id !== id));
}

export function publishGeneratedCourse(id: string): void {
  const course = getGeneratedCourseById(id);
  if (!course) return;
  saveGeneratedCourse({ ...course, status: "published" });
}

export function unpublishGeneratedCourse(id: string): void {
  const course = getGeneratedCourseById(id);
  if (!course) return;
  saveGeneratedCourse({ ...course, status: "draft" });
}

export function updateGeneratedCourseMeta(
  id: string,
  meta: Pick<GeneratedCoursePackage, "title" | "subtitle" | "description">
): void {
  const course = getGeneratedCourseById(id);
  if (!course) return;
  saveGeneratedCourse({ ...course, ...meta });
}

export function updateGeneratedCourseLevel(
  scenarioId: string,
  level: CefrLevel,
  content: GeneratedLevelContent
): void {
  const course = getGeneratedCourseByScenarioId(scenarioId);
  if (!course) return;
  saveGeneratedCourse({
    ...course,
    levels: { ...course.levels, [level]: content },
  });
}

export function updateGeneratedSimulation(
  scenarioId: string,
  simulationId: string,
  patch: Partial<GeneratedLevelContent["simulations"][number]>
): void {
  const course = getGeneratedCourseByScenarioId(scenarioId);
  if (!course) return;

  for (const [level, content] of Object.entries(course.levels)) {
    if (!content) continue;
    const sims = content.simulations.map((s) =>
      s.id === simulationId ? { ...s, ...patch } : s
    );
    if (sims.some((s, i) => s !== content.simulations[i])) {
      saveGeneratedCourse({
        ...course,
        levels: {
          ...course.levels,
          [level as CefrLevel]: { ...content, simulations: sims },
        },
      });
      return;
    }
  }
}
