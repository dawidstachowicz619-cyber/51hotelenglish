"use client";

import { useCallback, useEffect, useState } from "react";

import { isPhoneAuthAvailable } from "@/lib/auth/phone-auth-config";
import {
  addPoints,
  claimDailyBonus,
  claimCourseVisit,
  loadProfile,
  setUserInfo,
} from "@/lib/points/storage";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { tryLinkHrRegistration } from "@/lib/hr/hr-registration";
import type { PointsAction, UserPointsProfile } from "@/lib/types/points";
import { getLevelTitle } from "@/lib/points/rules";
import { getHotelRank, getUserRank } from "@/lib/points/leaderboard";

export function usePoints() {
  const [profile, setProfile] = useState<UserPointsProfile | null>(null);

  const refresh = useCallback(() => {
    setProfile(loadProfile());
  }, []);

  const maybeClaimDailyBonus = useCallback(async () => {
    const current = loadProfile();
    let mayClaim = Boolean(current.nickname?.trim());

    if (isPhoneAuthAvailable()) {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      mayClaim = !!data.user;
    }

    if (mayClaim) {
      claimDailyBonus();
      refresh();
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    void maybeClaimDailyBonus();

    const onUpdate = () => refresh();
    const onAuthChange = () => {
      void maybeClaimDailyBonus();
    };
    window.addEventListener("points-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    window.addEventListener("auth-linked", onAuthChange);
    window.addEventListener("auth-signed-out", onUpdate);
    return () => {
      window.removeEventListener("points-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("auth-linked", onAuthChange);
      window.removeEventListener("auth-signed-out", onUpdate);
    };
  }, [refresh, maybeClaimDailyBonus]);

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
    (nickname: string, hotel: string, phone?: string) => {
      setUserInfo(nickname, hotel, phone);
      tryLinkHrRegistration();
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
