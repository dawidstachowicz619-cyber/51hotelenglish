import { getDemoEmployeesForHotel } from "@/lib/hr/demo-roster";
import { getAllManagedHotels } from "@/lib/hr/hotel-registry";
import type { EmployeeLearningRecord, EmployeeUpdatePatch } from "@/lib/types/hr-admin";

const STORAGE_KEY = "51he-hr-roster";
const HIDDEN_KEY = "51he-hr-roster-hidden";

type RosterStore = Record<string, EmployeeLearningRecord[]>;
type HiddenStore = Record<string, string[]>;

function normalizeHotel(hotel: string): string {
  return hotel.trim();
}

function loadHiddenStore(): HiddenStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    return raw ? (JSON.parse(raw) as HiddenStore) : {};
  } catch {
    return {};
  }
}

function saveHiddenStore(store: HiddenStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(store));
}

function getHiddenIds(hotel: string): Set<string> {
  const key = normalizeHotel(hotel);
  return new Set(loadHiddenStore()[key] ?? []);
}

function isEmployeeHidden(hotel: string, employeeId: string): boolean {
  return getHiddenIds(hotel).has(employeeId);
}

function loadStore(): RosterStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RosterStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: RosterStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("hr-roster-updated"));
}

function mergeEmployees(
  demo: EmployeeLearningRecord[],
  live: EmployeeLearningRecord[],
  hiddenIds: Set<string>
): EmployeeLearningRecord[] {
  const map = new Map<string, EmployeeLearningRecord>();

  for (const emp of demo) {
    map.set(emp.id, emp);
  }

  for (const emp of live) {
    const existing = map.get(emp.id);
    const existingByPhone = emp.phone
      ? [...map.values()].find((e) => e.phone === emp.phone)
      : undefined;

    if (existing?.isLiveUser || emp.isLiveUser) {
      map.set(emp.id, { ...existing, ...emp, isLiveUser: true });
    } else if (existingByPhone && (emp.isImported || emp.isLiveUser)) {
      map.set(existingByPhone.id, { ...existingByPhone, ...emp });
    } else if (!existing) {
      map.set(emp.id, emp);
    }
  }

  return [...map.values()]
    .filter((emp) => !hiddenIds.has(emp.id))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

export function getHotelEmployees(hotel: string): EmployeeLearningRecord[] {
  const key = normalizeHotel(hotel);
  const store = loadStore();
  const demo = getDemoEmployeesForHotel(key);
  const live = store[key] ?? [];
  const hiddenIds = getHiddenIds(key);
  return mergeEmployees(demo, live, hiddenIds);
}

/** 全平台学员（去重），供平台管理员统计 */
export function getAllPlatformEmployees(): EmployeeLearningRecord[] {
  const byId = new Map<string, EmployeeLearningRecord>();
  for (const hotel of getAllManagedHotels()) {
    for (const emp of getHotelEmployees(hotel)) {
      byId.set(emp.id, emp);
    }
  }
  return [...byId.values()];
}

export function upsertHotelEmployee(
  hotel: string,
  employee: EmployeeLearningRecord
): void {
  const key = normalizeHotel(hotel);
  if (isEmployeeHidden(key, employee.id)) return;
  const store = loadStore();
  const current = store[key] ?? [];
  const idx = current.findIndex(
    (e) => e.id === employee.id || (employee.phone && e.phone === employee.phone)
  );
  const next =
    idx === -1
      ? [...current, employee]
      : current.map((e, i) => (i === idx ? { ...e, ...employee } : e));
  store[key] = next;
  saveStore(store);
}

export function bulkImportHotelEmployees(
  hotel: string,
  employees: EmployeeLearningRecord[]
): number {
  if (employees.length === 0) return 0;
  const key = normalizeHotel(hotel);
  const store = loadStore();
  const current = store[key] ?? [];
  const phoneSet = new Set(current.map((e) => e.phone).filter(Boolean));
  const toAdd: EmployeeLearningRecord[] = [];

  for (const emp of employees) {
    if (phoneSet.has(emp.phone)) continue;
    phoneSet.add(emp.phone);
    toAdd.push(emp);
  }

  store[key] = [...current, ...toAdd];
  saveStore(store);
  return toAdd.length;
}

export function getExistingPhones(hotel: string): Set<string> {
  return new Set(
    getHotelEmployees(hotel)
      .map((e) => e.phone)
      .filter(Boolean)
  );
}

export function addHotelEmployee(
  hotel: string,
  employee: EmployeeLearningRecord
): { ok: true } | { ok: false; error: string } {
  const key = normalizeHotel(hotel);
  if (!employee.nickname.trim()) {
    return { ok: false, error: "姓名为空" };
  }
  if (!employee.role.trim()) {
    return { ok: false, error: "职位为空" };
  }
  if (!employee.phone) {
    return { ok: false, error: "手机号为空" };
  }
  if (!/^1\d{10}$/.test(employee.phone)) {
    return { ok: false, error: "手机号格式不正确" };
  }
  if (getExistingPhones(key).has(employee.phone)) {
    return { ok: false, error: "该手机号已存在" };
  }

  const hidden = loadHiddenStore();
  const hiddenIds = hidden[key] ?? [];
  if (hiddenIds.includes(employee.id)) {
    hidden[key] = hiddenIds.filter((id) => id !== employee.id);
    saveHiddenStore(hidden);
  }

  upsertHotelEmployee(key, employee);
  return { ok: true };
}

export function updateHotelEmployee(
  hotel: string,
  employeeId: string,
  patch: EmployeeUpdatePatch
): { ok: true } | { ok: false; error: string } {
  const key = normalizeHotel(hotel);
  const employees = getHotelEmployees(key);
  const existing = employees.find((e) => e.id === employeeId);
  if (!existing) return { ok: false, error: "员工不存在" };

  if (patch.nickname !== undefined && !patch.nickname.trim()) {
    return { ok: false, error: "姓名为空" };
  }
  if (patch.role !== undefined && !patch.role.trim()) {
    return { ok: false, error: "职位为空" };
  }

  const next: EmployeeLearningRecord = {
    ...existing,
    nickname: patch.nickname?.trim() ?? existing.nickname,
    role: patch.role?.trim() ?? existing.role,
    department: patch.department ?? existing.department,
    status: patch.status ?? existing.status,
    hireDate: patch.hireDate === null ? undefined : patch.hireDate ?? existing.hireDate,
    probationEndDate:
      patch.probationEndDate === null
        ? undefined
        : patch.probationEndDate ?? existing.probationEndDate,
  };

  upsertHotelEmployee(key, next);
  return { ok: true };
}

export function removeHotelEmployee(hotel: string, employeeId: string): void {
  const key = normalizeHotel(hotel);
  const store = loadStore();
  const current = store[key] ?? [];
  store[key] = current.filter((e) => e.id !== employeeId);
  saveStore(store);

  const hidden = loadHiddenStore();
  const hiddenIds = new Set(hidden[key] ?? []);
  hiddenIds.add(employeeId);
  hidden[key] = [...hiddenIds];
  saveHiddenStore(hidden);
  window.dispatchEvent(new Event("hr-roster-updated"));
}
