import { NextResponse } from "next/server";

import { getHrSessionFromCookies } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import {
  addEmployee,
  bulkImportEmployees,
  hideEmployee,
  listHotelEmployees,
} from "@/lib/db/repositories/employees";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";

export async function GET() {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const session = await getHrSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employees = await listHotelEmployees(session.hotelName);
    return NextResponse.json({ employees });
  } catch (err) {
    console.error("[hr/employees GET]", err);
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
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
      action: "add" | "import" | "remove";
      employee?: EmployeeLearningRecord;
      employees?: EmployeeLearningRecord[];
      employeeId?: string;
    };

    if (body.action === "add" && body.employee) {
      const result = await addEmployee(session.hotelName, body.employee);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.action === "import" && body.employees) {
      const count = await bulkImportEmployees(session.hotelName, body.employees);
      return NextResponse.json({ imported: count });
    }

    if (body.action === "remove" && body.employeeId) {
      await hideEmployee(session.hotelName, body.employeeId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[hr/employees POST]", err);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
