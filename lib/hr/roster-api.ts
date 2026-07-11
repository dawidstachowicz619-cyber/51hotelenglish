import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import type { EmployeeLearningRecord, EmployeeUpdatePatch } from "@/lib/types/hr-admin";
import {
  addHotelEmployee,
  bulkImportHotelEmployees,
  getHotelEmployees,
  removeHotelEmployee,
  updateHotelEmployee,
} from "@/lib/hr/roster-storage";

export async function fetchHotelEmployees(
  hotel: string
): Promise<EmployeeLearningRecord[]> {
  if (!isCloudSyncActive()) {
    return getHotelEmployees(hotel);
  }

  const res = await fetch("/api/hr/employees", { credentials: "include" });
  if (!res.ok) return getHotelEmployees(hotel);
  const data = (await res.json()) as { employees: EmployeeLearningRecord[] };
  return data.employees;
}

export async function cloudAddEmployee(
  hotel: string,
  employee: EmployeeLearningRecord
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isCloudSyncActive()) {
    return addHotelEmployee(hotel, employee);
  }

  const res = await fetch("/api/hr/employees", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", employee }),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) return { ok: false, error: data.error ?? "添加失败" };
  return { ok: true };
}

export async function cloudImportEmployees(
  hotel: string,
  employees: EmployeeLearningRecord[]
): Promise<number> {
  if (!isCloudSyncActive()) {
    return bulkImportHotelEmployees(hotel, employees);
  }

  const res = await fetch("/api/hr/employees", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "import", employees }),
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as { imported: number };
  return data.imported;
}

export async function cloudRemoveEmployee(
  hotel: string,
  employeeId: string
): Promise<void> {
  if (!isCloudSyncActive()) {
    removeHotelEmployee(hotel, employeeId);
    return;
  }

  await fetch("/api/hr/employees", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "remove", employeeId }),
  });
}

export async function cloudUpdateEmployee(
  hotel: string,
  employeeId: string,
  patch: EmployeeUpdatePatch
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isCloudSyncActive()) {
    return updateHotelEmployee(hotel, employeeId, patch);
  }

  const res = await fetch("/api/hr/employees", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", employeeId, patch }),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) return { ok: false, error: data.error ?? "保存失败" };
  window.dispatchEvent(new Event("hr-roster-updated"));
  return { ok: true };
}

export async function cloudHrLogin(
  username: string,
  password: string
): Promise<
  | {
      ok: true;
      session: {
        hotel: string;
        accountId: string;
        username: string;
        displayName: string;
        loggedInAt: string;
      };
    }
  | { ok: false; error: string }
> {
  const res = await fetch("/api/hr/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = (await res.json()) as {
    error?: string;
    session?: {
      hotel: string;
      accountId: string;
      username: string;
      displayName: string;
      loggedInAt: string;
    };
  };
  if (!res.ok) return { ok: false, error: data.error ?? "登录失败" };
  if (!data.session) return { ok: false, error: "登录失败" };
  return { ok: true, session: data.session };
}

export async function cloudHrLogout(): Promise<void> {
  await fetch("/api/hr/logout", { method: "POST", credentials: "include" });
}

export async function fetchPlatformEmployees(): Promise<EmployeeLearningRecord[]> {
  if (!isCloudSyncActive()) {
    const { getAllPlatformEmployees } = await import("@/lib/hr/roster-storage");
    return getAllPlatformEmployees();
  }

  const password = sessionStorage.getItem("51he-platform-admin-session");
  if (!password) return [];

  const res = await fetch("/api/platform/employees", {
    headers: { "x-platform-admin-password": password },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { employees: EmployeeLearningRecord[] };
  return data.employees;
}
