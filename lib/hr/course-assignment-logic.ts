import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type {
  CourseAssignMode,
  HotelCourseAssignment,
} from "@/lib/types/course-catalog";

export type AssignCatalogCourseOptions = {
  assignMode: CourseAssignMode;
  department?: EmployeeDepartment;
  employeeIds?: string[];
  required?: boolean;
};

export function resolveAssignMode(assignment: HotelCourseAssignment): CourseAssignMode {
  if (assignment.assignMode) return assignment.assignMode;
  if (assignment.employeeIds?.length) return "employees";
  if (assignment.department === "all") return "all";
  return "department";
}

export function assignmentMatchesEmployee(
  assignment: HotelCourseAssignment,
  department: EmployeeDepartment,
  employeeId: string
): boolean {
  const mode = resolveAssignMode(assignment);
  if (mode === "employees") {
    return (assignment.employeeIds ?? []).includes(employeeId);
  }
  if (mode === "all") return true;
  return assignment.department === department;
}

export function sortAssignments(
  assignments: HotelCourseAssignment[]
): HotelCourseAssignment[] {
  return [...assignments].sort(
    (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
  );
}

export function applyAssignCatalogCourse(
  assignments: HotelCourseAssignment[],
  catalogCourseId: string,
  options: AssignCatalogCourseOptions
): { ok: true; assignments: HotelCourseAssignment[] } | { ok: false; error: string } {
  const { assignMode, department, employeeIds, required = true } = options;

  if (assignMode === "employees" && !employeeIds?.length) {
    return { ok: false, error: "请至少选择一名员工" };
  }
  if (assignMode === "department" && !department) {
    return { ok: false, error: "请选择部门" };
  }

  const list = [...assignments];
  const existing = list.findIndex((a) => a.catalogCourseId === catalogCourseId);

  const entry: HotelCourseAssignment = {
    catalogCourseId,
    assignMode,
    department:
      assignMode === "all"
        ? "all"
        : assignMode === "department"
          ? department!
          : "all",
    employeeIds: assignMode === "employees" ? employeeIds : undefined,
    assignedAt: new Date().toISOString(),
    required,
  };

  if (existing >= 0) {
    list[existing] = entry;
  } else {
    list.push(entry);
  }

  return { ok: true, assignments: sortAssignments(list) };
}

export function applyUnassignCatalogCourse(
  assignments: HotelCourseAssignment[],
  catalogCourseId: string
): HotelCourseAssignment[] {
  return sortAssignments(
    assignments.filter((a) => a.catalogCourseId !== catalogCourseId)
  );
}

export function applySetEmployeeCourseAssignment(
  assignments: HotelCourseAssignment[],
  catalogCourseId: string,
  employeeId: string,
  enabled: boolean,
  allEmployees: { id: string; department: EmployeeDepartment }[]
): { ok: true; assignments: HotelCourseAssignment[] } | { ok: false; error: string } {
  const employee = allEmployees.find((e) => e.id === employeeId);
  if (!employee) return { ok: false, error: "员工不存在" };

  const existing = assignments.find((a) => a.catalogCourseId === catalogCourseId);

  if (enabled) {
    if (!existing) {
      return applyAssignCatalogCourse(assignments, catalogCourseId, {
        assignMode: "employees",
        employeeIds: [employeeId],
      });
    }
    const mode = resolveAssignMode(existing);
    if (mode === "all") return { ok: true, assignments };
    if (mode === "department" && existing.department === employee.department) {
      return { ok: true, assignments };
    }
    const ids = new Set([...(existing.employeeIds ?? []), employeeId]);
    return applyAssignCatalogCourse(assignments, catalogCourseId, {
      assignMode: "employees",
      employeeIds: [...ids],
    });
  }

  if (!existing) return { ok: true, assignments };
  const mode = resolveAssignMode(existing);
  if (mode === "employees") {
    const ids = (existing.employeeIds ?? []).filter((id) => id !== employeeId);
    if (ids.length === 0) {
      return { ok: true, assignments: applyUnassignCatalogCourse(assignments, catalogCourseId) };
    }
    return applyAssignCatalogCourse(assignments, catalogCourseId, {
      assignMode: "employees",
      employeeIds: ids,
    });
  }
  if (mode === "all") {
    const ids = allEmployees.filter((e) => e.id !== employeeId).map((e) => e.id);
    if (ids.length === 0) {
      return { ok: true, assignments: applyUnassignCatalogCourse(assignments, catalogCourseId) };
    }
    return applyAssignCatalogCourse(assignments, catalogCourseId, {
      assignMode: "employees",
      employeeIds: ids,
    });
  }
  if (mode === "department") {
    const ids = allEmployees
      .filter((e) => e.department === existing.department && e.id !== employeeId)
      .map((e) => e.id);
    if (ids.length === 0) {
      return { ok: true, assignments: applyUnassignCatalogCourse(assignments, catalogCourseId) };
    }
    return applyAssignCatalogCourse(assignments, catalogCourseId, {
      assignMode: "employees",
      employeeIds: ids,
    });
  }
  return { ok: true, assignments };
}
