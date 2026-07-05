"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addPoints,
  claimDailyBonus,
  claimCourseVisit,
  loadProfile,
  setUserInfo,
} from "@/lib/points/storage";
import type { PointsAction, UserPointsProfile } from "@/lib/types/points";
import { getLevelTitle } from "@/lib/points/rules";
import { getHotelRank, getUserRank } from "@/lib/points/leaderboard";

export function usePoints() {
  const [profile, setProfile] = useState<UserPointsProfile | null>(null);

  const refresh = useCallback(() => {
    setProfile(loadProfile());
  }, []);

  useEffect(() => {
    refresh();
    claimDailyBonus();
    refresh();

    const onUpdate = () => refresh();
    window.addEventListener("points-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("points-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const earn = useCallback(
    (
      action: PointsAction,
      extra?: { label?: string; points?: number; meta?: Record<string, unknown> }
    ) => {
      const result = addPoints(action, extra);
      refresh();
      return result;
    },
    [refresh]
  );

  const saveUserInfo = useCallback(
    (nickname: string, hotel: string) => {
      setUserInfo(nickname, hotel);
      refresh();
    },
    [refresh]
  );

  const enterCourse = useCallback(
    (slug: string) => {
      const earned = claimCourseVisit(slug);
      refresh();
      return earned;
    },
    [refresh]
  );

  const levelTitle = profile ? getLevelTitle(profile.totalPoints) : "";
  const weeklyRank = profile ? getUserRank(profile, "weekly") : 0;
  const alltimeRank = profile ? getUserRank(profile, "alltime") : 0;
  const hotelWeeklyRank = profile ? getHotelRank(profile, "weekly") : 0;
  const hotelAlltimeRank = profile ? getHotelRank(profile, "alltime") : 0;
  const hasHotel = !!profile?.hotel?.trim();

  return {
    profile,
    refresh,
    earn,
    saveUserInfo,
    enterCourse,
    levelTitle,
    weeklyRank,
    alltimeRank,
    hotelWeeklyRank,
    hotelAlltimeRank,
    hasHotel,
    isProfileComplete: !!profile?.nickname,
  };
}
