import { getAvailableHotels as getDemoHotels } from "@/lib/hr/demo-roster";

const REGISTRY_KEY = "51he-hotel-registry";

function loadRegistry(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRegistry(hotels: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(hotels));
  window.dispatchEvent(new Event("hotel-registry-updated"));
}

export function getRegisteredHotels(): string[] {
  return loadRegistry();
}

export function getAllManagedHotels(): string[] {
  const merged = new Set([...getDemoHotels(), ...loadRegistry()]);
  return [...merged].sort();
}

export function registerHotel(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const existing = getAllManagedHotels();
  if (existing.some((h) => h.toLowerCase() === trimmed.toLowerCase())) {
    return false;
  }
  saveRegistry([...loadRegistry(), trimmed]);
  return true;
}

export function unregisterHotel(name: string): void {
  const trimmed = name.trim();
  saveRegistry(loadRegistry().filter((h) => h !== trimmed));
}
