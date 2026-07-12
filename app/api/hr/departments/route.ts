import { NextResponse } from "next/server";

import { getHrSessionFromCookies } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import {
  deleteHotelDepartmentsCloud,
  listHotelDepartmentsCloud,
  migrateHotelDepartmentsCloud,
  saveHotelDepartmentsCloud,
} from "@/lib/db/repositories/hotel-departments";
import { DEFAULT_HOTEL_DEPARTMENTS } from "@/lib/types/hotel-department";
import type { HotelDepartment } from "@/lib/types/hotel-department";

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
    const localRaw = url.searchParams.get("localDepartments");
    let departments =
      (await listHotelDepartmentsCloud(session.hotelName)) ??
      DEFAULT_HOTEL_DEPARTMENTS.map((d) => ({ ...d }));

    if (
      departments.length === DEFAULT_HOTEL_DEPARTMENTS.length &&
      localRaw
    ) {
      try {
        const local = JSON.parse(localRaw) as HotelDepartment[];
        if (Array.isArray(local) && local.length > 0) {
          departments = await migrateHotelDepartmentsCloud(session.hotelName, local);
        }
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({ departments });
  } catch (err) {
    console.error("[hr/departments GET]", err);
    return NextResponse.json({ error: "Failed to load departments" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const session = await getHrSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { departments?: HotelDepartment[] };
    if (!body.departments || !Array.isArray(body.departments)) {
      return NextResponse.json({ error: "Invalid departments" }, { status: 400 });
    }
    const departments = await saveHotelDepartmentsCloud(
      session.hotelName,
      body.departments
    );
    return NextResponse.json({ departments });
  } catch (err) {
    console.error("[hr/departments PUT]", err);
    return NextResponse.json({ error: "Failed to save departments" }, { status: 500 });
  }
}

export async function DELETE() {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const session = await getHrSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteHotelDepartmentsCloud(session.hotelName);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[hr/departments DELETE]", err);
    return NextResponse.json({ error: "Failed to reset departments" }, { status: 500 });
  }
}
