import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LeaderboardEntry, LeaderboardPeriod } from "@/lib/types/points";

export async function fetchLeaderboardFromDb(
  period: LeaderboardPeriod,
  options?: { hotel?: string; currentUserId?: string; limit?: number }
): Promise<LeaderboardEntry[]> {
  const db = getSupabaseAdmin();
  const orderCol = period === "weekly" ? "weekly_points" : "total_points";

  let query = db
    .from("learner_profiles")
    .select("id, nickname, hotel_name, total_points, weekly_points, cefr_level")
    .neq("nickname", "")
    .order(orderCol, { ascending: false })
    .limit(options?.limit ?? 50);

  if (options?.hotel?.trim()) {
    query = query.eq("hotel_name", options.hotel.trim());
  }

  const { data, error } = await query;
  if (error) throw error;

  const entries: LeaderboardEntry[] = (data ?? []).map((row, index) => ({
    rank: index + 1,
    id: row.id,
    nickname: row.nickname,
    hotel: row.hotel_name || "—",
    points: period === "weekly" ? row.weekly_points : row.total_points,
    cefrLevel: row.cefr_level,
    isCurrentUser: row.id === options?.currentUserId,
    badge:
      index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : undefined,
  }));

  const hasUser = entries.some((e) => e.isCurrentUser);
  if (options?.currentUserId && !hasUser) {
    const { data: me } = await db
      .from("learner_profiles")
      .select("id, nickname, hotel_name, total_points, weekly_points, cefr_level")
      .eq("id", options.currentUserId)
      .maybeSingle();
    if (me?.nickname) {
      entries.push({
        rank: 0,
        id: me.id,
        nickname: me.nickname,
        hotel: me.hotel_name || "—",
        points: period === "weekly" ? me.weekly_points : me.total_points,
        cefrLevel: me.cefr_level,
        isCurrentUser: true,
      });
    }
  }

  return entries
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      badge:
        index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : undefined,
    }));
}

export async function fetchUserRankFromDb(
  userId: string,
  period: LeaderboardPeriod,
  hotel?: string
): Promise<number> {
  const board = await fetchLeaderboardFromDb(period, {
    hotel,
    currentUserId: userId,
    limit: 500,
  });
  return board.find((e) => e.isCurrentUser)?.rank ?? board.length;
}
