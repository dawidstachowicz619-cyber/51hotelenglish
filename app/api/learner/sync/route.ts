import { NextResponse } from "next/server";

import { getLearnerIdFromCookies } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import type { LearnerSyncPayload } from "@/lib/db/mappers";
import { syncLearnerData } from "@/lib/db/repositories/learner-data";
import { linkLearnerToEmployeeByPhone } from "@/lib/db/repositories/learners";

export async function POST(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const learnerId = await getLearnerIdFromCookies();
  if (!learnerId) {
    return NextResponse.json({ error: "No learner session" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as LearnerSyncPayload;
    await syncLearnerData(learnerId, body);

    const profile = body.profile;
    if (profile?.phone && profile.hotel) {
      await linkLearnerToEmployeeByPhone(learnerId, profile.phone, profile.hotel);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[learner/sync]", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
