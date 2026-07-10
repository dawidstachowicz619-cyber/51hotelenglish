import { NextResponse } from "next/server";

import { isCloudStorageEnabled } from "@/lib/db/config";
import { listAllEmployees } from "@/lib/db/repositories/employees";

export async function GET(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const adminPassword = request.headers.get("x-platform-admin-password");
  if (adminPassword !== process.env.PLATFORM_ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employees = await listAllEmployees();
    return NextResponse.json({ employees });
  } catch (err) {
    console.error("[platform/employees GET]", err);
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
  }
}
