import { NextResponse } from "next/server";

import { getLearnerIdFromCookies } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import type { LearnerSyncPayload } from "@/lib/db/mappers";
import { syncLearnerData } from "@/lib/db/repositories/learner-data";
import { linkLearnerToEmployeeByPhone } from "@/lib/db/repositories/learners";
import { getAuthUserId } from "@/lib/supabase/server-auth";
import { linkAuthUserToLearner } from "@/lib/db/repositories/profile-merge";

/** One-shot upload of localStorage snapshot into cloud profile. */
export async function PUT(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const cookieLearnerId = await getLearnerIdFromCookies();
  if (!cookieLearnerId) {
    return NextResponse.json({ error: "No learner session" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as LearnerSyncPayload;
    const authUserId = await getAuthUserId();

    let targetId = cookieLearnerId;
    if (authUserId) {
      const linked = await linkAuthUserToLearner(
        authUserId,
        cookieLearnerId,
        body.profile?.phone
      );
      targetId = linked.learnerId;
    }

    await syncLearnerData(targetId, body);

    const profile = body.profile;
    if (profile?.phone && profile.hotel) {
      await linkLearnerToEmployeeByPhone(targetId, profile.phone, profile.hotel);
    }

    return NextResponse.json({ ok: true, learnerId: targetId });
  } catch (err) {
    console.error("[learner/migrate]", err);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
