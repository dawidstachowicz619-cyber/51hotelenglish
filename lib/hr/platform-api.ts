import {
  createHrAdminAccount,
  deleteHrAdminAccount,
  getHrAccountsByHotel,
  updateHrAdminAccount,
} from "@/lib/hr/hr-admin-accounts";
import {
  getAllHotelHrPermissions,
  getHotelHrPermissions,
  hasHrPermission,
  isHotelHrAccessEnabled,
  saveHotelHrPermissions,
  setAllHotelHrPermissions,
  setHotelHrEnabled,
  setHotelHrPermission,
} from "@/lib/hr/hotel-hr-permissions";
import {
  getAllManagedHotels,
  registerHotel,
} from "@/lib/hr/hotel-registry";
import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import type {
  CreateHrAdminAccountInput,
  HrAdminAccount,
  UpdateHrAdminAccountInput,
} from "@/lib/types/hr-admin-account";
import type { HotelHrPermissions, HrPermissionKey } from "@/lib/types/hr-permissions";

function platformPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("51he-platform-admin-session");
}

function platformHeaders(): HeadersInit {
  const password = platformPassword();
  return password ? { "x-platform-admin-password": password } : {};
}

export async function fetchManagedHotels(): Promise<string[]> {
  if (!isCloudSyncActive()) return getAllManagedHotels();

  const res = await fetch("/api/platform/hotels", { headers: platformHeaders() });
  if (!res.ok) return getAllManagedHotels();
  const data = (await res.json()) as { hotels: string[] };
  return data.hotels;
}

export async function fetchHotelPermissionsList(
  hotels: string[]
): Promise<HotelHrPermissions[]> {
  if (!isCloudSyncActive()) return getAllHotelHrPermissions(hotels);

  const res = await fetch("/api/platform/hotels", { headers: platformHeaders() });
  if (!res.ok) return getAllHotelHrPermissions(hotels);
  const data = (await res.json()) as { permissions: HotelHrPermissions[] };
  return data.permissions;
}

export async function cloudRegisterHotel(name: string): Promise<boolean> {
  if (!isCloudSyncActive()) return registerHotel(name);

  const res = await fetch("/api/platform/hotels", {
    method: "POST",
    headers: { ...platformHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register_hotel", hotel: name }),
  });
  return res.ok;
}

export async function cloudSaveHotelPermissions(
  config: HotelHrPermissions
): Promise<void> {
  if (!isCloudSyncActive()) {
    saveHotelHrPermissions(config);
    return;
  }

  await fetch("/api/platform/hotels", {
    method: "POST",
    headers: { ...platformHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save_permissions", permissions: config }),
  });
}

export async function cloudSetHotelHrEnabled(
  hotel: string,
  enabled: boolean
): Promise<void> {
  const current = isCloudSyncActive()
    ? (await fetchHotelPermissionsList([hotel]))[0]
    : getHotelHrPermissions(hotel);
  if (!current) return;
  await cloudSaveHotelPermissions({ ...current, enabled });
}

export async function cloudSetHotelHrPermission(
  hotel: string,
  permission: HrPermissionKey,
  allowed: boolean
): Promise<void> {
  const current = isCloudSyncActive()
    ? (await fetchHotelPermissionsList([hotel]))[0]
    : getHotelHrPermissions(hotel);
  if (!current) return;
  await cloudSaveHotelPermissions({
    ...current,
    permissions: { ...current.permissions, [permission]: allowed },
  });
}

export async function cloudSetAllHotelHrPermissions(
  hotel: string,
  allowed: boolean
): Promise<void> {
  if (!isCloudSyncActive()) {
    setAllHotelHrPermissions(hotel, allowed);
    return;
  }
  const current = (await fetchHotelPermissionsList([hotel]))[0];
  if (!current) return;
  const permissions = Object.fromEntries(
    Object.keys(current.permissions).map((k) => [k, allowed])
  ) as HotelHrPermissions["permissions"];
  await cloudSaveHotelPermissions({ ...current, permissions });
}

export async function checkHotelHrAccessEnabled(hotel: string): Promise<boolean> {
  if (!isCloudSyncActive()) return isHotelHrAccessEnabled(hotel);
  const config = (await fetchHotelPermissionsList([hotel]))[0];
  return config?.enabled ?? true;
}

export async function checkHrPermission(
  hotel: string,
  permission: HrPermissionKey
): Promise<boolean> {
  if (!isCloudSyncActive()) return hasHrPermission(hotel, permission);
  const config = (await fetchHotelPermissionsList([hotel]))[0];
  if (!config?.enabled) return false;
  return config.permissions[permission] ?? true;
}

export async function fetchHotelHrAccounts(hotel: string): Promise<HrAdminAccount[]> {
  if (!isCloudSyncActive()) return getHrAccountsByHotel(hotel);

  const res = await fetch(
    `/api/platform/hr-accounts?hotel=${encodeURIComponent(hotel)}`,
    { headers: platformHeaders() }
  );
  if (!res.ok) return getHrAccountsByHotel(hotel);
  const data = (await res.json()) as { accounts: HrAdminAccount[] };
  return data.accounts;
}

export async function cloudCreateHrAdminAccount(
  input: CreateHrAdminAccountInput
): Promise<{ account: HrAdminAccount } | { error: string }> {
  if (!isCloudSyncActive()) return createHrAdminAccount(input);

  const res = await fetch("/api/platform/hr-accounts", {
    method: "POST",
    headers: { ...platformHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as { account?: HrAdminAccount; error?: string };
  if (!res.ok) return { error: data.error ?? "创建失败" };
  if (!data.account) return { error: "创建失败" };
  window.dispatchEvent(new Event("hr-admin-accounts-updated"));
  return { account: data.account };
}

export async function cloudUpdateHrAdminAccount(
  id: string,
  patch: UpdateHrAdminAccountInput
): Promise<{ account: HrAdminAccount } | { error: string }> {
  if (!isCloudSyncActive()) return updateHrAdminAccount(id, patch);

  const res = await fetch("/api/platform/hr-accounts", {
    method: "PATCH",
    headers: { ...platformHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...patch }),
  });
  const data = (await res.json()) as { account?: HrAdminAccount; error?: string };
  if (!res.ok) return { error: data.error ?? "保存失败" };
  if (!data.account) return { error: "保存失败" };
  window.dispatchEvent(new Event("hr-admin-accounts-updated"));
  return { account: data.account };
}

export async function cloudDeleteHrAdminAccount(
  id: string
): Promise<{ ok: true } | { error: string }> {
  if (!isCloudSyncActive()) {
    deleteHrAdminAccount(id);
    return { ok: true };
  }

  const res = await fetch(`/api/platform/hr-accounts?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: platformHeaders(),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) return { error: data.error ?? "删除失败" };
  window.dispatchEvent(new Event("hr-admin-accounts-updated"));
  return { ok: true };
}

// Re-export local setters for non-cloud fallback used by platform dashboard
export {
  setHotelHrEnabled,
  setHotelHrPermission,
  setAllHotelHrPermissions,
};
