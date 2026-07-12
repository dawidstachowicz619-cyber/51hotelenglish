import { NextResponse } from "next/server";

import { getHrSessionFromCookies } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import {
  listHotelCourseAssignments,
  migrateHotelCourseAssignments,
  replaceHotelCourseAssignments,
} from "@/lib/db/repositories/course-assignments";
import {
  applyAssignCatalogCourse,
  applySetEmployeeCourseAssignment,
  applyUnassignCatalogCourse,
  type AssignCatalogCourseOptions,
} from "@/lib/hr/course-assignment-logic";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HotelCourseAssignment } from "@/lib/types/course-catalog";

export async function GET(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const session = await getHrSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const localRaw = url.searchParams.get("localAssignments");
    let assignments = await listHotelCourseAssignments(session.hotelName);

    if (assignments.length === 0 && localRaw) {
      try {
        const localAssignments = JSON.parse(localRaw) as HotelCourseAssignment[];
        if (Array.isArray(localAssignments) && localAssignments.length > 0) {
          assignments = await migrateHotelCourseAssignments(
            session.hotelName,
            localAssignments
          );
        }
      } catch {
        /* ignore malformed local payload */
      }
    }

    return NextResponse.json({ assignments });
  } catch (err) {
    console.error("[hr/course-assignments GET]", err);
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const session = await getHrSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action: "assign" | "unassign" | "setEmployee" | "replace";
      catalogCourseId?: string;
      options?: AssignCatalogCourseOptions;
      employeeId?: string;
      enabled?: boolean;
      allEmployees?: { id: string; department: EmployeeDepartment }[];
      assignments?: HotelCourseAssignment[];
    };

    const current = await listHotelCourseAssignments(session.hotelName);
    let next = current;

    if (body.action === "replace" && body.assignments) {
      next = await replaceHotelCourseAssignments(session.hotelName, body.assignments);
      return NextResponse.json({ assignments: next });
    }

    if (body.action === "assign" && body.catalogCourseId && body.options) {
      const result = applyAssignCatalogCourse(current, body.catalogCourseId, body.options);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      next = await replaceHotelCourseAssignments(session.hotelName, result.assignments);
      return NextResponse.json({ assignments: next });
    }

    if (body.action === "unassign" && body.catalogCourseId) {
      next = await replaceHotelCourseAssignments(
        session.hotelName,
        applyUnassignCatalogCourse(current, body.catalogCourseId)
      );
      return NextResponse.json({ assignments: next });
    }

    if (
      body.action === "setEmployee" &&
      body.catalogCourseId &&
      body.employeeId !== undefined &&
      body.enabled !== undefined &&
      body.allEmployees
    ) {
      const result = applySetEmployeeCourseAssignment(
        current,
        body.catalogCourseId,
        body.employeeId,
        body.enabled,
        body.allEmployees
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      next = await replaceHotelCourseAssignments(session.hotelName, result.assignments);
      return NextResponse.json({ assignments: next });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[hr/course-assignments POST]", err);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
