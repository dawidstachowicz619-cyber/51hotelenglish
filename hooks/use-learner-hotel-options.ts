"use client";

import { useCallback, useEffect, useState } from "react";

import { getAllManagedHotels } from "@/lib/hr/hotel-registry";
import { buildLearnerHotelOptions } from "@/lib/hr/learner-hotel-options";
import { isCloudSyncActive } from "@/lib/storage/cloud-sync";

export function useLearnerHotelOptions() {
  const [hotels, setHotels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (isCloudSyncActive()) {
        const res = await fetch("/api/hotels");
        if (res.ok) {
          const data = (await res.json()) as { hotels: string[] };
          setHotels(data.hotels);
          return;
        }
      }
      setHotels(buildLearnerHotelOptions(getAllManagedHotels()));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener("hotel-registry-updated", onUpdate);
    return () => window.removeEventListener("hotel-registry-updated", onUpdate);
  }, [refresh]);

  return { hotels, loading };
}
