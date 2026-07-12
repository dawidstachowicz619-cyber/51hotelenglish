import {
  DEFAULT_HOTEL_DEPARTMENTS,
  HOTEL_DEPARTMENTS_STORAGE_KEY,
  isFrontDeskDepartmentId,
  type HotelDepartment,
} from "@/lib/types/hotel-department";
import type { FrontDeskDepartmentId } from "@/lib/types/front-desk-department";

type DepartmentStore = Record<string, HotelDepartment[]>;

function loadStore(): DepartmentStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HOTEL_DEPARTMENTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DepartmentStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: DepartmentStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOTEL_DEPARTMENTS_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("hotel-departments-updated"));
}

export function replaceHotelDepartments(
  hotel: string,
  departments: HotelDepartment[]
): void {
  const key = normalizeHotel(hotel);
  const store = loadStore();
  store[key] = departments.map((d, index) => ({ ...d, order: index }));
  saveStore(store);
}

function normalizeHotel(hotel: string): string {
  return hotel.trim();
}

export function getHotelDepartments(hotel: string): HotelDepartment[] {
  const key = normalizeHotel(hotel);
  const custom = loadStore()[key];
  if (custom && custom.length > 0) {
    return [...custom].sort((a, b) => a.order - b.order);
  }
  return DEFAULT_HOTEL_DEPARTMENTS.map((d) => ({ ...d }));
}

export function saveHotelDepartments(
  hotel: string,
  departments: HotelDepartment[]
): void {
  const key = normalizeHotel(hotel);
  const store = loadStore();
  store[key] = departments.map((d, index) => ({ ...d, order: index }));
  saveStore(store);
}

export function resetHotelDepartmentsToDefault(hotel: string): void {
  const key = normalizeHotel(hotel);
  const store = loadStore();
  delete store[key];
  saveStore(store);
}

export function getHotelDepartmentById(
  hotel: string,
  departmentId: string
): HotelDepartment | undefined {
  return getHotelDepartments(hotel).find((d) => d.id === departmentId);
}

export function getDepartmentLabel(hotel: string, departmentId: string): string {
  const dept = getHotelDepartmentById(hotel, departmentId);
  if (dept) return dept.name;
  if (departmentId === "other") return "其他部门";
  return departmentId;
}

export function getCourseTrackForDepartment(
  hotel: string,
  departmentId: string
): FrontDeskDepartmentId {
  const dept = getHotelDepartmentById(hotel, departmentId);
  if (dept?.courseTrackId) return dept.courseTrackId;
  if (isFrontDeskDepartmentId(departmentId)) return departmentId;
  return "reception";
}

export function findDepartmentByName(
  hotel: string,
  raw: string
): HotelDepartment | undefined {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!key) return undefined;
  return getHotelDepartments(hotel).find((d) => {
    const nameKey = d.name.trim().toLowerCase().replace(/\s+/g, "");
    const idKey = d.id.toLowerCase();
    return nameKey === key || idKey === key || nameKey.includes(key) || key.includes(nameKey);
  });
}

export function createDepartmentId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `dept-${slug || "custom"}-${Date.now().toString(36)}`;
}

export function getDepartmentLabelsMap(hotel: string): Record<string, string> {
  const map: Record<string, string> = { other: "其他部门" };
  for (const d of getHotelDepartments(hotel)) {
    map[d.id] = d.name;
  }
  return map;
}
