import { NextResponse } from "next/server";

import { getLearnerIdFromCookies } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import { fetchLeaderboardFromDb } from "@/lib/db/repositories/leaderboard";
import type { LeaderboardPeriod, LeaderboardScope } from "@/lib/types/points";

export async function GET(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "weekly") as LeaderboardPeriod;
  const scope = (searchParams.get("scope") ?? "global") as LeaderboardScope;
  const hotel = searchParams.get("hotel") ?? undefined;
  const learnerId = await getLearnerIdFromCookies();

  try {
    const entries = await fetchLeaderboardFromDb(period, {
      hotel: scope === "hotel" ? hotel : undefined,
      currentUserId: learnerId ?? undefined,
    });
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[leaderboard]", err);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
