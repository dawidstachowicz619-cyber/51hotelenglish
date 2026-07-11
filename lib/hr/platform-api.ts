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
import { PLATFORM_ADMIN_PASSWORD_KEY } from "@/lib/types/hr-permissions";

function platformPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PLATFORM_ADMIN_PASSWORD_KEY);
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

export type LearningExportListItem = {
  id: string;
  exportDate: string;
  versionNo: number;
  storagePath: string;
  sizeBytes: number;
  sizeLabel: string;
  rowCounts: {
    hotels: number;
    employees: number;
    learnerProfiles: number;
    learningProgress: number;
    learningHistory: number;
    hotelHrPermissions: number;
    hrAdminAccounts: number;
  };
  createdAt: string;
};

export async function fetchLearningExports(): Promise<
  | {
      exports: LearningExportListItem[];
      retentionVersions: number;
      cloudEnabled: boolean;
      autoSchedule: string;
      timezone: string;
    }
  | { error: string }
> {
  const res = await fetch("/api/platform/learning-exports", {
    headers: platformHeaders(),
  });
  const data = (await res.json().catch(() => ({}))) as {
    exports?: LearningExportListItem[];
    retentionVersions?: number;
    cloudEnabled?: boolean;
    autoSchedule?: string;
    timezone?: string;
    error?: string;
  };
  if (!res.ok) {
    if (res.status === 401) {
      return { error: "认证失败，请点击右上角「退出登录」后重新输入管理员密码" };
    }
    return { error: data.error ?? "加载失败" };
  }
  return {
    exports: data.exports ?? [],
    retentionVersions: data.retentionVersions ?? 30,
    cloudEnabled: data.cloudEnabled ?? false,
    autoSchedule: data.autoSchedule ?? "",
    timezone: data.timezone ?? "Asia/Shanghai",
  };
}

export async function triggerLearningExportNow(): Promise<
  | { ok: true; exportDate: string; sizeLabel: string }
  | { error: string }
> {
  const res = await fetch("/api/platform/learning-exports", {
    method: "POST",
    headers: platformHeaders(),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    snapshot?: { exportDate: string; sizeLabel: string };
    error?: string;
  };
  if (!res.ok) {
    if (res.status === 401) {
      return { error: "认证失败，请退出后重新登录" };
    }
    return { error: data.error ?? "打包失败" };
  }
  return {
    ok: true,
    exportDate: data.snapshot?.exportDate ?? "",
    sizeLabel: data.snapshot?.sizeLabel ?? "",
  };
}

export async function downloadLearningExport(snapshotId: string, exportDate: string): Promise<void> {
  const res = await fetch(`/api/platform/learning-exports/${snapshotId}`, {
    headers: platformHeaders(),
  });
  if (!res.ok) {
    throw new Error("下载失败");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `learning-data-${exportDate}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);
}

// Re-export local setters for non-cloud fallback used by platform dashboard
export {
  setHotelHrEnabled,
  setHotelHrPermission,
  setAllHotelHrPermissions,
};
