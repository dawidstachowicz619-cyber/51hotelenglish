"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getDepartmentProgressPercent,
  loadRussianCampaignProgress,
} from "@/lib/course/russian-campaign-progress-storage";
import type {
  RussianCampaignDepartment,
  RussianCampaignProgress,
} from "@/lib/types/hotel-russian-campaign";

export function useRussianCampaignProgress(department: RussianCampaignDepartment) {
  const [progress, setProgress] = useState<RussianCampaignProgress | null>(null);

  const refresh = useCallback(() => {
    setProgress(loadRussianCampaignProgress(department));
  }, [department]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("russian-campaign-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("russian-campaign-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const percent = getDepartmentProgressPercent(department, 30);

  return { progress, refresh, percent };
}
