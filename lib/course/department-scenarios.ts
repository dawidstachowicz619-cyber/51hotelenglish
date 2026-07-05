import { getPublishedGeneratedCourses } from "@/lib/course/generated-course-storage";
import { DEPARTMENT_BY_ID, type FrontDeskDepartmentId } from "@/lib/types/front-desk-department";

/** 内置场景 + 已发布的 AI 生成场景 */
export function getDepartmentScenarioIds(
  departmentId: FrontDeskDepartmentId
): string[] {
  const base = DEPARTMENT_BY_ID[departmentId]?.scenarioIds ?? [];
  if (typeof window === "undefined") return base;

  const generated = getPublishedGeneratedCourses()
    .filter((c) => c.departmentId === departmentId)
    .map((c) => c.scenarioId);

  return [...base, ...generated];
}

export function isGeneratedScenarioId(scenarioId: string): boolean {
  return scenarioId.startsWith("gen-");
}
