import type { HrTrainingModule } from "@/lib/types/hr-training";
import { PLATFORM_MANAGEMENT_COURSES_KEY } from "@/lib/types/hr-training";

function loadAll(): HrTrainingModule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLATFORM_MANAGEMENT_COURSES_KEY);
    return raw ? (JSON.parse(raw) as HrTrainingModule[]) : [];
  } catch {
    return [];
  }
}

function saveAll(modules: HrTrainingModule[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLATFORM_MANAGEMENT_COURSES_KEY, JSON.stringify(modules));
  window.dispatchEvent(new Event("platform-management-courses-updated"));
  window.dispatchEvent(new Event("hr-training-updated"));
}

export function getPlatformManagementCourses(): HrTrainingModule[] {
  return loadAll().sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function addPlatformManagementCourse(module: HrTrainingModule): void {
  const list = loadAll().filter((m) => m.id !== module.id);
  saveAll([
    {
      ...module,
      hotel: "platform",
      phase: "management",
      source: "platform",
    },
    ...list,
  ]);
}

export function removePlatformManagementCourse(moduleId: string): HrTrainingModule | undefined {
  const list = loadAll();
  const removed = list.find((m) => m.id === moduleId);
  saveAll(list.filter((m) => m.id !== moduleId));
  return removed;
}

export function updatePlatformManagementCourse(
  moduleId: string,
  patch: Partial<HrTrainingModule>
): void {
  saveAll(
    loadAll().map((m) => (m.id === moduleId ? { ...m, ...patch, id: moduleId } : m))
  );
}
