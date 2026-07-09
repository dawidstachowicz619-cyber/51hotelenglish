import { getBuiltinManagementModules } from "@/lib/data/management-training-modules";
import { getPlatformManagementCourses } from "@/lib/hr/platform-management-course-storage";
import { getTrainingModulesForEmployee } from "@/lib/hr/training-storage";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HrTrainingModule } from "@/lib/types/hr-training";

function isManagementModule(mod: HrTrainingModule): boolean {
  return mod.phase === "management";
}

/** HR 上传的管理培训课程 */
export function getUploadedManagementModules(
  hotel: string,
  department: EmployeeDepartment
): HrTrainingModule[] {
  return getTrainingModulesForEmployee(hotel, department).filter(isManagementModule);
}

/** 内置 + 平台发布 + HR 上传 */
export function getVisibleManagementModules(
  hotel: string,
  department: EmployeeDepartment
): HrTrainingModule[] {
  const builtin = getBuiltinManagementModules().map((m) => ({
    ...m,
    hotel,
    deliveryType: m.deliveryType ?? "slides",
    source: m.source ?? "builtin",
  }));
  const platform = getPlatformManagementCourses().map((m) => ({
    ...m,
    hotel,
  }));
  const uploaded = getUploadedManagementModules(hotel, department);
  const reservedIds = new Set([
    ...builtin.map((m) => m.id),
    ...platform.map((m) => m.id),
  ]);
  const extra = uploaded.filter((m) => !reservedIds.has(m.id));
  return [...platform, ...builtin, ...extra].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function isManagerRole(role: string): boolean {
  return /主管|经理|管理|manager|supervisor|总监|leader/i.test(role);
}
