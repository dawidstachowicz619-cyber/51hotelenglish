import {
  HOTEL_HR_PERMISSIONS_KEY,
  HR_PERMISSION_KEYS,
  type HotelHrPermissions,
  type HrPermissionKey,
} from "@/lib/types/hr-permissions";

export const HR_PERMISSION_DEFAULTS: Record<HrPermissionKey, boolean> = {
  dashboard: true,
  employees: true,
  departments: true,
  catalog: true,
  training: true,
  reports: true,
};

type PermissionStore = Record<string, HotelHrPermissions>;

function loadStore(): PermissionStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HOTEL_HR_PERMISSIONS_KEY);
    return raw ? (JSON.parse(raw) as PermissionStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: PermissionStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOTEL_HR_PERMISSIONS_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("hotel-hr-permissions-updated"));
}

function normalizePermissions(
  partial?: Partial<Record<HrPermissionKey, boolean>>
): Record<HrPermissionKey, boolean> {
  return { ...HR_PERMISSION_DEFAULTS, ...partial };
}

export function getHotelHrPermissions(hotel: string): HotelHrPermissions {
  const key = hotel.trim();
  const stored = loadStore()[key];
  if (!stored) {
    return {
      hotel: key,
      enabled: true,
      permissions: { ...HR_PERMISSION_DEFAULTS },
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    ...stored,
    permissions: normalizePermissions(stored.permissions),
  };
}

export function getAllHotelHrPermissions(hotels: string[]): HotelHrPermissions[] {
  return hotels.map((h) => getHotelHrPermissions(h));
}

export function saveHotelHrPermissions(config: HotelHrPermissions): void {
  const key = config.hotel.trim();
  const store = loadStore();
  store[key] = {
    ...config,
    hotel: key,
    permissions: normalizePermissions(config.permissions),
    updatedAt: new Date().toISOString(),
  };
  saveStore(store);
}

export function setHotelHrEnabled(hotel: string, enabled: boolean): void {
  const current = getHotelHrPermissions(hotel);
  saveHotelHrPermissions({ ...current, enabled });
}

export function setHotelHrPermission(
  hotel: string,
  permission: HrPermissionKey,
  allowed: boolean
): void {
  const current = getHotelHrPermissions(hotel);
  saveHotelHrPermissions({
    ...current,
    permissions: { ...current.permissions, [permission]: allowed },
  });
}

export function setAllHotelHrPermissions(
  hotel: string,
  allowed: boolean
): void {
  const current = getHotelHrPermissions(hotel);
  const permissions = HR_PERMISSION_KEYS.reduce(
    (acc, key) => {
      acc[key] = allowed;
      return acc;
    },
    {} as Record<HrPermissionKey, boolean>
  );
  saveHotelHrPermissions({ ...current, permissions });
}

export function hasHrPermission(
  hotel: string,
  permission: HrPermissionKey
): boolean {
  const config = getHotelHrPermissions(hotel);
  if (!config.enabled) return false;
  return config.permissions[permission] ?? true;
}

export function isHotelHrAccessEnabled(hotel: string): boolean {
  return getHotelHrPermissions(hotel).enabled;
}
