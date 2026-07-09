import { getDepartmentLabel } from "@/lib/hr/hotel-department-storage";
import { hasHrPermission } from "@/lib/hr/hotel-hr-permissions";
import type { HrAdminSession } from "@/lib/types/hr-admin";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";

function isHrEmployee(employee: EmployeeLearningRecord): boolean {
  const role = employee.role.toLowerCase();
  if (/人力|hr|human.?resource/i.test(role)) return true;

  const deptId = employee.department.toLowerCase();
  if (deptId === "hr" || deptId === "human-resources" || deptId === "human_resources") {
    return true;
  }

  const deptLabel = getDepartmentLabel(employee.hotel, employee.department).toLowerCase();
  return /人力|hr/i.test(deptLabel);
}

/** HR 管理员登录或人力资源部员工可在 Grow in Hotel 上传培训文档 */
export function canUploadHrTraining(
  employee: EmployeeLearningRecord,
  hrSession: HrAdminSession | null
): boolean {
  if (hrSession?.hotel === employee.hotel) {
    return hasHrPermission(employee.hotel, "training");
  }
  return isHrEmployee(employee);
}
