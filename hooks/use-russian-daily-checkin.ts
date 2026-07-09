"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildRussianDailyPack,
  getTodayDateISO,
} from "@/lib/course/russian-daily-pack";
import {
  isTodayCheckInComplete,
  loadRussianDailyCheckIn,
} from "@/lib/course/russian-daily-checkin-storage";
import { loadProfile } from "@/lib/points/storage";
import type { RussianDailyCheckInRecord, RussianDailyPack } from "@/lib/types/russian-daily-checkin";

export function useRussianDailyCheckIn() {
  const [record, setRecord] = useState<RussianDailyCheckInRecord | null>(null);
  const [today] = useState(getTodayDateISO);

  const refresh = useCallback(() => {
    setRecord(loadRussianDailyCheckIn());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("russian-daily-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("russian-daily-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const todayPack: RussianDailyPack | null = useMemo(() => {
    if (typeof window === "undefined") return null;
    const profile = loadProfile();
    return buildRussianDailyPack(today, profile.userId);
  }, [today]);

  const todayComplete = record ? isTodayCheckInComplete(today) : false;
  const todaySession = record?.sessions[today];

  return {
    record,
    today,
    todayPack,
    todayComplete,
    todaySession,
    refresh,
  };
}
