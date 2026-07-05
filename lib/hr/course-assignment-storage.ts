import { getCatalogCourseById } from "@/lib/data/general-course-catalog";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import type {
  CatalogCourse,
  HotelCourseAssignment,
} from "@/lib/types/course-catalog";
import { HOTEL_COURSE_ASSIGNMENTS_KEY } from "@/lib/types/course-catalog";

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

export function getHotelCourseAssignments(hotel: string): HotelCourseAssignment[] {
  const key = hotel.trim();
  return (loadStore()[key] ?? []).sort(
    (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
  );
}

export function assignCatalogCourse(
  hotel: string,
  catalogCourseId: string,
  department: EmployeeDepartment | "all",
  required = true
): void {
  const key = hotel.trim();
  const store = loadStore();
  const list = store[key] ?? [];
  const existing = list.findIndex((a) => a.catalogCourseId === catalogCourseId);
  const entry: HotelCourseAssignment = {
    catalogCourseId,
    department,
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
  department: EmployeeDepartment
): { assignment: HotelCourseAssignment; course: CatalogCourse }[] {
  return getHotelCourseAssignments(hotel)
    .filter((a) => a.department === "all" || a.department === department)
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
