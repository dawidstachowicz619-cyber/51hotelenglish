import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import type { LeaderboardEntry, LeaderboardPeriod, LeaderboardScope } from "@/lib/types/points";
import {
  buildHotelLeaderboard,
  buildLeaderboard,
  getHotelRank,
  getUserRank,
} from "@/lib/points/leaderboard";
import type { UserPointsProfile } from "@/lib/types/points";

export async function fetchLeaderboard(
  profile: UserPointsProfile,
  period: LeaderboardPeriod,
  scope: LeaderboardScope
): Promise<LeaderboardEntry[]> {
  if (!isCloudSyncActive()) {
    return scope === "hotel"
      ? buildHotelLeaderboard(profile, period)
      : buildLeaderboard(profile, period);
  }

  const params = new URLSearchParams({ period, scope });
  if (scope === "hotel" && profile.hotel) {
    params.set("hotel", profile.hotel);
  }

  const res = await fetch(`/api/leaderboard?${params}`, { credentials: "include" });
  if (!res.ok) {
    return scope === "hotel"
      ? buildHotelLeaderboard(profile, period)
      : buildLeaderboard(profile, period);
  }

  const data = (await res.json()) as { entries: LeaderboardEntry[] };
  return data.entries;
}

export async function fetchUserRank(
  profile: UserPointsProfile,
  period: LeaderboardPeriod,
  scope: LeaderboardScope
): Promise<number> {
  if (!isCloudSyncActive()) {
    return scope === "hotel"
      ? getHotelRank(profile, period)
      : getUserRank(profile, period);
  }

  const board = await fetchLeaderboard(profile, period, scope);
  return board.find((e) => e.isCurrentUser)?.rank ?? board.length;
}
