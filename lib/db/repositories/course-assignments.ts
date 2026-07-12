import { findHotelByName } from "@/lib/db/repositories/hotels";
import { resolveAssignMode, sortAssignments } from "@/lib/hr/course-assignment-logic";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { HotelCourseAssignmentRow } from "@/lib/supabase/database.types";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HotelCourseAssignment } from "@/lib/types/course-catalog";

function rowToAssignment(row: HotelCourseAssignmentRow): HotelCourseAssignment {
  const employeeIds = Array.isArray(row.employee_ids)
    ? (row.employee_ids as string[])
    : [];
  return {
    catalogCourseId: row.catalog_course_id,
    assignMode: row.assign_mode,
    department: row.department as EmployeeDepartment | "all",
    employeeIds: employeeIds.length > 0 ? employeeIds : undefined,
    assignedAt: row.assigned_at,
    required: row.required,
  };
}

function assignmentToRow(
  hotelId: string,
  assignment: HotelCourseAssignment
): Omit<HotelCourseAssignmentRow, "id" | "updated_at"> & { updated_at?: string } {
  const assignMode = resolveAssignMode(assignment);
  return {
    hotel_id: hotelId,
    catalog_course_id: assignment.catalogCourseId,
    assign_mode: assignMode,
    department: assignment.department,
    employee_ids: assignment.employeeIds ?? [],
    required: assignment.required,
    assigned_at: assignment.assignedAt,
    updated_at: new Date().toISOString(),
  };
}

export async function listHotelCourseAssignments(
  hotelName: string
): Promise<HotelCourseAssignment[]> {
  const hotel = await findHotelByName(hotelName.trim());
  if (!hotel) return [];

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("hotel_course_assignments")
    .select("*")
    .eq("hotel_id", hotel.id)
    .order("assigned_at", { ascending: false });
  if (error) throw error;

  return sortAssignments((data ?? []).map(rowToAssignment));
}

export async function replaceHotelCourseAssignments(
  hotelName: string,
  assignments: HotelCourseAssignment[]
): Promise<HotelCourseAssignment[]> {
  const hotel = await findHotelByName(hotelName.trim());
  if (!hotel) return [];

  const db = getSupabaseAdmin();
  const sorted = sortAssignments(assignments);

  const { error: deleteError } = await db
    .from("hotel_course_assignments")
    .delete()
    .eq("hotel_id", hotel.id);
  if (deleteError) throw deleteError;

  if (sorted.length === 0) return [];

  const rows = sorted.map((assignment) => assignmentToRow(hotel.id, assignment));
  const { data, error } = await db
    .from("hotel_course_assignments")
    .insert(rows)
    .select("*");
  if (error) throw error;

  return sortAssignments((data ?? []).map(rowToAssignment));
}

export async function migrateHotelCourseAssignments(
  hotelName: string,
  localAssignments: HotelCourseAssignment[]
): Promise<HotelCourseAssignment[]> {
  const existing = await listHotelCourseAssignments(hotelName);
  if (existing.length > 0) return existing;
  if (localAssignments.length === 0) return [];
  return replaceHotelCourseAssignments(hotelName, localAssignments);
}
