import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import {
  getHotelDepartments,
  replaceHotelDepartments,
  saveHotelDepartments,
} from "@/lib/hr/hotel-department-storage";
import type { HotelDepartment } from "@/lib/types/hotel-department";

export async function fetchHotelDepartments(hotel: string): Promise<HotelDepartment[]> {
  if (!isCloudSyncActive()) return getHotelDepartments(hotel);

  const local = getHotelDepartments(hotel);
  const hasCustomLocal = (() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("51he-hotel-departments");
      const store = raw ? (JSON.parse(raw) as Record<string, HotelDepartment[]>) : {};
      return (store[hotel.trim()] ?? []).length > 0;
    } catch {
      return false;
    }
  })();

  const query = hasCustomLocal
    ? `?localDepartments=${encodeURIComponent(JSON.stringify(local))}`
    : "";

  const res = await fetch(`/api/hr/departments${query}`, { credentials: "include" });
  if (!res.ok) return local;
  const data = (await res.json()) as { departments?: HotelDepartment[] };
  if (!Array.isArray(data.departments)) return local;

  replaceHotelDepartments(hotel, data.departments);
  return data.departments;
}

export async function cloudSaveHotelDepartments(
  hotel: string,
  departments: HotelDepartment[]
): Promise<HotelDepartment[]> {
  if (!isCloudSyncActive()) {
    saveHotelDepartments(hotel, departments);
    return departments;
  }

  const res = await fetch("/api/hr/departments", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ departments }),
  });
  const data = (await res.json()) as { departments?: HotelDepartment[]; error?: string };
  if (!res.ok || !data.departments) {
    saveHotelDepartments(hotel, departments);
    return departments;
  }
  replaceHotelDepartments(hotel, data.departments);
  return data.departments;
}

export async function cloudResetHotelDepartments(hotel: string): Promise<void> {
  if (!isCloudSyncActive()) {
    const { resetHotelDepartmentsToDefault } = await import(
      "@/lib/hr/hotel-department-storage"
    );
    resetHotelDepartmentsToDefault(hotel);
    return;
  }

  const res = await fetch("/api/hr/departments", {
    method: "DELETE",
    credentials: "include",
  });
  if (res.ok) {
    const { resetHotelDepartmentsToDefault } = await import(
      "@/lib/hr/hotel-department-storage"
    );
    resetHotelDepartmentsToDefault(hotel);
  }
}
