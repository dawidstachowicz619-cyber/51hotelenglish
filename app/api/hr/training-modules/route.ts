import { NextResponse } from "next/server";

import { getHrSessionFromCookies } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import {
  listHotelTrainingModules,
  migrateHotelTrainingModules,
  removeHotelTrainingModule,
  upsertHotelTrainingModule,
} from "@/lib/db/repositories/training-modules";
import type { HrTrainingModule } from "@/lib/types/hr-training";

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
    const localRaw = url.searchParams.get("localModules");
    let modules = await listHotelTrainingModules(session.hotelName);

    if (modules.length === 0 && localRaw) {
      try {
        const local = JSON.parse(localRaw) as HrTrainingModule[];
        if (Array.isArray(local) && local.length > 0) {
          modules = await migrateHotelTrainingModules(session.hotelName, local);
        }
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({ modules });
  } catch (err) {
    console.error("[hr/training-modules GET]", err);
    return NextResponse.json({ error: "Failed to load modules" }, { status: 500 });
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
      action: "add" | "remove" | "update";
      module?: HrTrainingModule;
      moduleId?: string;
      patch?: Partial<Pick<HrTrainingModule, "department" | "phase" | "ask" | "title">>;
    };

    if (body.action === "add" && body.module) {
      const module = await upsertHotelTrainingModule({
        ...body.module,
        hotel: session.hotelName,
      });
      return NextResponse.json({ module });
    }

    if (body.action === "remove" && body.moduleId) {
      await removeHotelTrainingModule(session.hotelName, body.moduleId);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "update" && body.moduleId && body.patch) {
      const existing = (await listHotelTrainingModules(session.hotelName)).find(
        (m) => m.id === body.moduleId
      );
      if (!existing) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
      const module = await upsertHotelTrainingModule({ ...existing, ...body.patch });
      return NextResponse.json({ module });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[hr/training-modules POST]", err);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
