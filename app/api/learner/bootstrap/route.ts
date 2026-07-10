import { NextResponse } from "next/server";

import {
  getLearnerIdFromCookies,
  setLearnerCookie,
} from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import { resolveLearnerForSession } from "@/lib/db/repositories/profile-merge";
import { getAuthUserId } from "@/lib/supabase/server-auth";

export async function GET() {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  try {
    const authUserId = await getAuthUserId();
    const cookieLearnerId = await getLearnerIdFromCookies();
    const { learnerId, payload } = await resolveLearnerForSession(
      authUserId,
      cookieLearnerId
    );
    await setLearnerCookie(learnerId);
    return NextResponse.json({
      learnerId,
      ...payload,
      authLinked: !!authUserId,
    });
  } catch (err) {
    console.error("[learner/bootstrap]", err);
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
  }
}
