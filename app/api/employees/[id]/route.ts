import { NextResponse } from "next/server";

import { isCloudStorageEnabled } from "@/lib/db/config";
import { getEmployeeById } from "@/lib/db/repositories/employees";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const { id } = await params;
  const adminPassword = _request.headers.get("x-platform-admin-password");
  const hrCookie = _request.headers.get("cookie")?.includes("51he_hr_session");

  if (!hrCookie && adminPassword !== process.env.PLATFORM_ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employee = await getEmployeeById(id);
    if (!employee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ employee });
  } catch (err) {
    console.error("[employees/id GET]", err);
    return NextResponse.json({ error: "Failed to load employee" }, { status: 500 });
  }
}
