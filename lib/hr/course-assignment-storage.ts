import { getCatalogCourseById } from "@/lib/data/general-course-catalog";
import {
  applyAssignCatalogCourse,
  applySetEmployeeCourseAssignment,
  applyUnassignCatalogCourse,
  assignmentMatchesEmployee,
  resolveAssignMode,
  sortAssignments,
  type AssignCatalogCourseOptions,
} from "@/lib/hr/course-assignment-logic";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import type {
  CatalogCourse,
  HotelCourseAssignment,
} from "@/lib/types/course-catalog";
import { HOTEL_COURSE_ASSIGNMENTS_KEY } from "@/lib/types/course-catalog";

export type { AssignCatalogCourseOptions };

type AssignmentStore = Record<string, HotelCourseAssignment[]>;

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

export function replaceHotelCourseAssignments(
  hotel: string,
  assignments: HotelCourseAssignment[]
): void {
  const key = hotel.trim();
  const store = loadStore();
  store[key] = sortAssignments(assignments);
  saveStore(store);
}

export { resolveAssignMode, assignmentMatchesEmployee };

export function getHotelCourseAssignments(hotel: string): HotelCourseAssignment[] {
  const key = hotel.trim();
  return sortAssignments(loadStore()[key] ?? []);
}

export function assignCatalogCourse(
  hotel: string,
  catalogCourseId: string,
  options: AssignCatalogCourseOptions
): { ok: true } | { ok: false; error: string } {
  const key = hotel.trim();
  const store = loadStore();
  const list = store[key] ?? [];
  const result = applyAssignCatalogCourse(list, catalogCourseId, options);
  if (!result.ok) return result;
  store[key] = result.assignments;
  saveStore(store);
  return { ok: true };
}

export function unassignCatalogCourse(hotel: string, catalogCourseId: string): void {
  const key = hotel.trim();
  const store = loadStore();
  store[key] = applyUnassignCatalogCourse(store[key] ?? [], catalogCourseId);
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

export function isCourseAssignedToEmployee(
  hotel: string,
  catalogCourseId: string,
  department: EmployeeDepartment,
  employeeId: string
): boolean {
  const assignment = getHotelCourseAssignments(hotel).find(
    (a) => a.catalogCourseId === catalogCourseId
  );
  if (!assignment) return false;
  return assignmentMatchesEmployee(assignment, department, employeeId);
}

export function setEmployeeCourseAssignment(
  hotel: string,
  catalogCourseId: string,
  employeeId: string,
  enabled: boolean,
  allEmployees: { id: string; department: EmployeeDepartment }[]
): { ok: true } | { ok: false; error: string } {
  const key = hotel.trim();
  const store = loadStore();
  const list = store[key] ?? [];
  const result = applySetEmployeeCourseAssignment(
    list,
    catalogCourseId,
    employeeId,
    enabled,
    allEmployees
  );
  if (!result.ok) return result;
  store[key] = result.assignments;
  saveStore(store);
  return { ok: true };
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
