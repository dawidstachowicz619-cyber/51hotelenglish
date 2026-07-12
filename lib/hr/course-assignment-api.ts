import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HotelCourseAssignment } from "@/lib/types/course-catalog";
import {
  getHotelCourseAssignments,
  replaceHotelCourseAssignments,
  type AssignCatalogCourseOptions,
} from "@/lib/hr/course-assignment-storage";

async function parseAssignmentsResponse(
  res: Response
): Promise<HotelCourseAssignment[] | null> {
  if (!res.ok) return null;
  const data = (await res.json()) as { assignments?: HotelCourseAssignment[] };
  return Array.isArray(data.assignments) ? data.assignments : null;
}

export async function fetchHotelCourseAssignments(
  hotel: string
): Promise<HotelCourseAssignment[]> {
  if (!isCloudSyncActive()) {
    return getHotelCourseAssignments(hotel);
  }

  const localAssignments = getHotelCourseAssignments(hotel);
  const query =
    localAssignments.length > 0
      ? `?localAssignments=${encodeURIComponent(JSON.stringify(localAssignments))}`
      : "";

  const res = await fetch(`/api/hr/course-assignments${query}`, {
    credentials: "include",
  });
  const assignments = await parseAssignmentsResponse(res);
  if (!assignments) return localAssignments;

  replaceHotelCourseAssignments(hotel, assignments);
  return assignments;
}

export async function fetchLearnerCourseAssignments(
  hotel: string
): Promise<HotelCourseAssignment[]> {
  if (!isCloudSyncActive()) {
    return getHotelCourseAssignments(hotel);
  }

  const localAssignments = getHotelCourseAssignments(hotel);
  const res = await fetch(
    `/api/learner/course-assignments?hotel=${encodeURIComponent(hotel)}`
  );
  const assignments = await parseAssignmentsResponse(res);
  if (!assignments) return localAssignments;

  replaceHotelCourseAssignments(hotel, assignments);
  return assignments;
}

export async function cloudAssignCatalogCourse(
  hotel: string,
  catalogCourseId: string,
  options: AssignCatalogCourseOptions
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isCloudSyncActive()) {
    const { assignCatalogCourse } = await import("@/lib/hr/course-assignment-storage");
    return assignCatalogCourse(hotel, catalogCourseId, options);
  }

  const res = await fetch("/api/hr/course-assignments", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "assign", catalogCourseId, options }),
  });
  const data = (await res.json()) as { error?: string; assignments?: HotelCourseAssignment[] };
  if (!res.ok) return { ok: false, error: data.error ?? "分配失败" };
  if (data.assignments) replaceHotelCourseAssignments(hotel, data.assignments);
  return { ok: true };
}

export async function cloudUnassignCatalogCourse(
  hotel: string,
  catalogCourseId: string
): Promise<void> {
  if (!isCloudSyncActive()) {
    const { unassignCatalogCourse } = await import("@/lib/hr/course-assignment-storage");
    unassignCatalogCourse(hotel, catalogCourseId);
    return;
  }

  const res = await fetch("/api/hr/course-assignments", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "unassign", catalogCourseId }),
  });
  const data = (await res.json()) as { assignments?: HotelCourseAssignment[] };
  if (res.ok && data.assignments) {
    replaceHotelCourseAssignments(hotel, data.assignments);
  }
}

export async function cloudSetEmployeeCourseAssignment(
  hotel: string,
  catalogCourseId: string,
  employeeId: string,
  enabled: boolean,
  allEmployees: { id: string; department: EmployeeDepartment }[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isCloudSyncActive()) {
    const { setEmployeeCourseAssignment } = await import(
      "@/lib/hr/course-assignment-storage"
    );
    return setEmployeeCourseAssignment(
      hotel,
      catalogCourseId,
      employeeId,
      enabled,
      allEmployees
    );
  }

  const res = await fetch("/api/hr/course-assignments", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "setEmployee",
      catalogCourseId,
      employeeId,
      enabled,
      allEmployees,
    }),
  });
  const data = (await res.json()) as { error?: string; assignments?: HotelCourseAssignment[] };
  if (!res.ok) return { ok: false, error: data.error ?? "保存失败" };
  if (data.assignments) replaceHotelCourseAssignments(hotel, data.assignments);
  return { ok: true };
}
