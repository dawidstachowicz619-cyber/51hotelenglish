import { NextResponse } from "next/server";

import { isCloudStorageEnabled } from "@/lib/db/config";
import {
  listAllHotelHrPermissions,
  listManagedHotelsCloud,
  registerHotelCloud,
  saveHotelHrPermissionsCloud,
} from "@/lib/db/repositories/hr-permissions";
import type { HotelHrPermissions } from "@/lib/types/hr-permissions";

function assertPlatformAdmin(request: Request): boolean {
  return (
    request.headers.get("x-platform-admin-password") ===
    process.env.PLATFORM_ADMIN_PASSWORD
  );
}

export async function GET(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }
  if (!assertPlatformAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hotels = await listManagedHotelsCloud();
    const permissions = await listAllHotelHrPermissions(hotels);
    return NextResponse.json({ hotels, permissions });
  } catch (err) {
    console.error("[platform/hotels GET]", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }
  if (!assertPlatformAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action: "register_hotel" | "save_permissions";
      hotel?: string;
      permissions?: HotelHrPermissions;
    };

    if (body.action === "register_hotel" && body.hotel) {
      const ok = await registerHotelCloud(body.hotel);
      if (!ok) {
        return NextResponse.json({ error: "酒店名称无效或已存在" }, { status: 400 });
      }
      const hotels = await listManagedHotelsCloud();
      return NextResponse.json({ hotels });
    }

    if (body.action === "save_permissions" && body.permissions) {
      const saved = await saveHotelHrPermissionsCloud(body.permissions);
      return NextResponse.json({ permissions: saved });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[platform/hotels POST]", err);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
