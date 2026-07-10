"use client";

import { useCallback, useEffect, useState } from "react";

import { checkHrPermission, checkHotelHrAccessEnabled } from "@/lib/hr/platform-api";
import { getHotelHrPermissions } from "@/lib/hr/hotel-hr-permissions";
import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import type { HotelHrPermissions, HrPermissionKey } from "@/lib/types/hr-permissions";

export function useHrPermissions(hotel: string | null) {
  const [config, setConfig] = useState<HotelHrPermissions | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [permissions, setPermissions] = useState<Record<HrPermissionKey, boolean>>({
    dashboard: true,
    employees: true,
    departments: true,
    catalog: true,
    training: true,
    reports: true,
  });

  const refresh = useCallback(() => {
    if (!hotel) {
      setConfig(null);
      setEnabled(false);
      return;
    }

    if (isCloudSyncActive()) {
      void (async () => {
        const { fetchHotelPermissionsList } = await import("@/lib/hr/platform-api");
        const list = await fetchHotelPermissionsList([hotel]);
        const cfg = list[0] ?? null;
        setConfig(cfg);
        setEnabled(cfg?.enabled ?? true);
        if (cfg) setPermissions(cfg.permissions);
      })();
      return;
    }

    const local = getHotelHrPermissions(hotel);
    setConfig(local);
    setEnabled(local.enabled);
    setPermissions(local.permissions);
  }, [hotel]);

  useEffect(() => {
    refresh();
    window.addEventListener("hotel-hr-permissions-updated", refresh);
    return () => window.removeEventListener("hotel-hr-permissions-updated", refresh);
  }, [refresh]);

  const can = useCallback(
    (permission: HrPermissionKey) => {
      if (!hotel) return false;
      if (isCloudSyncActive()) {
        if (!enabled) return false;
        return permissions[permission] ?? true;
      }
      return permissions[permission] ?? true;
    },
    [hotel, enabled, permissions]
  );

  return { config, enabled, can, refresh };
}

export async function isHrAccessEnabledForHotel(hotel: string): Promise<boolean> {
  if (isCloudSyncActive()) return checkHotelHrAccessEnabled(hotel);
  const { isHotelHrAccessEnabled } = await import("@/lib/hr/hotel-hr-permissions");
  return isHotelHrAccessEnabled(hotel);
}

export async function hasHrPermissionForHotel(
  hotel: string,
  permission: HrPermissionKey
): Promise<boolean> {
  if (isCloudSyncActive()) return checkHrPermission(hotel, permission);
  const { hasHrPermission } = await import("@/lib/hr/hotel-hr-permissions");
  return hasHrPermission(hotel, permission);
}
