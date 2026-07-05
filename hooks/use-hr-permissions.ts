"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getHotelHrPermissions,
  hasHrPermission,
  isHotelHrAccessEnabled,
} from "@/lib/hr/hotel-hr-permissions";
import type { HotelHrPermissions, HrPermissionKey } from "@/lib/types/hr-permissions";

export function useHrPermissions(hotel: string | null) {
  const [config, setConfig] = useState<HotelHrPermissions | null>(null);

  const refresh = useCallback(() => {
    if (!hotel) {
      setConfig(null);
      return;
    }
    setConfig(getHotelHrPermissions(hotel));
  }, [hotel]);

  useEffect(() => {
    refresh();
    window.addEventListener("hotel-hr-permissions-updated", refresh);
    return () => window.removeEventListener("hotel-hr-permissions-updated", refresh);
  }, [refresh]);

  const can = useCallback(
    (permission: HrPermissionKey) =>
      hotel ? hasHrPermission(hotel, permission) : false,
    [hotel, config]
  );

  const enabled = hotel ? isHotelHrAccessEnabled(hotel) : false;

  return { config, enabled, can, refresh };
}
