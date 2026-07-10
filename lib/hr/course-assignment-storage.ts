import { getCatalogCourseById } from "@/lib/data/general-course-catalog";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import type {
  CatalogCourse,
  CourseAssignMode,
  HotelCourseAssignment,
} from "@/lib/types/course-catalog";
import { HOTEL_COURSE_ASSIGNMENTS_KEY } from "@/lib/types/course-catalog";

type AssignmentStore = Record<string, HotelCourseAssignment[]>;

export type AssignCatalogCourseOptions = {
  assignMode: CourseAssignMode;
  department?: EmployeeDepartment;
  employeeIds?: string[];
  required?: boolean;
};

function loadStore(): AssignmentStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HOTEL_COURSE_ASSIGNMENTS_KEY);
    return raw ? (JSON.parse(raw) as AssignmentStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: AssignmentStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOTEL_COURSE_ASSIGNMENTS_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("hotel-course-assignments-updated"));
}

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

export function getHotelCourseAssignments(hotel: string): HotelCourseAssignment[] {
  const key = hotel.trim();
  return (loadStore()[key] ?? []).sort(
    (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
  );
}

export function assignCatalogCourse(
  hotel: string,
  catalogCourseId: string,
  options: AssignCatalogCourseOptions
): { ok: true } | { ok: false; error: string } {
  const { assignMode, department, employeeIds, required = true } = options;

  if (assignMode === "employees" && !employeeIds?.length) {
    return { ok: false, error: "请至少选择一名员工" };
  }
  if (assignMode === "department" && !department) {
    return { ok: false, error: "请选择部门" };
  }

  const key = hotel.trim();
  const store = loadStore();
  const list = store[key] ?? [];
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
  store[key] = list;
  saveStore(store);
  return { ok: true };
}

export function unassignCatalogCourse(hotel: string, catalogCourseId: string): void {
  const key = hotel.trim();
  const store = loadStore();
  store[key] = (store[key] ?? []).filter((a) => a.catalogCourseId !== catalogCourseId);
  saveStore(store);
}

export function isCatalogCourseAssigned(hotel: string, catalogCourseId: string): boolean {
  return getHotelCourseAssignments(hotel).some(
    (a) => a.catalogCourseId === catalogCourseId
  );
}

export function getAssignedCatalogCoursesForEmployee(
  hotel: string,
  department: EmployeeDepartment,
  employeeId: string
): { assignment: HotelCourseAssignment; course: CatalogCourse }[] {
  return getHotelCourseAssignments(hotel)
    .filter((a) => assignmentMatchesEmployee(a, department, employeeId))
    .map((assignment) => {
      const course = getCatalogCourseById(assignment.catalogCourseId);
      return course ? { assignment, course } : null;
    })
    .filter((x): x is { assignment: HotelCourseAssignment; course: CatalogCourse } =>
      Boolean(x)
    );
}

export function catalogCourseToTrainingModule(
  course: CatalogCourse,
  hotel: string
): HrTrainingModule | null {
  if (course.delivery.type !== "training") return null;
  const { slides, questions } = course.delivery;
  return {
    id: course.id,
    hotel,
    title: course.title,
    fileName: "catalog",
    uploadedAt: new Date().toISOString(),
    department: "all",
    phase: course.phase,
    ask: course.ask,
    slides,
    questions,
    slideCount: slides.length,
    questionCount: questions.length,
  };
}
