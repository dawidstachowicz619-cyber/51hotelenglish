import {
  HR_PERMISSION_KEYS,
  type HotelHrPermissions,
  type HrPermissionKey,
} from "@/lib/types/hr-permissions";
import { HR_PERMISSION_DEFAULTS } from "@/lib/hr/hotel-hr-permissions";
import { ensureHotel, listHotels } from "@/lib/db/repositories/hotels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function normalizePermissions(
  partial?: Partial<Record<HrPermissionKey, boolean>>
): Record<HrPermissionKey, boolean> {
  return { ...HR_PERMISSION_DEFAULTS, ...partial };
}

export async function getHotelHrPermissionsCloud(
  hotelName: string
): Promise<HotelHrPermissions> {
  const hotel = await ensureHotel(hotelName.trim());
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("hotel_hr_permissions")
    .select("*")
    .eq("hotel_id", hotel.id)
    .maybeSingle();

  const config = (data?.config ?? {}) as Partial<HotelHrPermissions>;
  return {
    hotel: hotel.name,
    enabled: config.enabled ?? true,
    permissions: normalizePermissions(config.permissions),
    updatedAt: data?.updated_at ?? new Date().toISOString(),
  };
}

export async function listAllHotelHrPermissions(
  hotelNames: string[]
): Promise<HotelHrPermissions[]> {
  return Promise.all(hotelNames.map((h) => getHotelHrPermissionsCloud(h)));
}

export async function saveHotelHrPermissionsCloud(
  config: HotelHrPermissions
): Promise<HotelHrPermissions> {
  const hotel = await ensureHotel(config.hotel.trim());
  const db = getSupabaseAdmin();
  const payload = {
    hotel_id: hotel.id,
    config: {
      enabled: config.enabled,
      permissions: normalizePermissions(config.permissions),
    },
    updated_at: new Date().toISOString(),
  };

  const { error } = await db
    .from("hotel_hr_permissions")
    .upsert(payload, { onConflict: "hotel_id" });
  if (error) throw error;

  return getHotelHrPermissionsCloud(hotel.name);
}

export async function listManagedHotelsCloud(): Promise<string[]> {
  const rows = await listHotels();
  return rows.map((h) => h.name).sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export async function registerHotelCloud(name: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const existing = await listManagedHotelsCloud();
  if (existing.some((h) => h.toLowerCase() === trimmed.toLowerCase())) {
    return false;
  }
  await ensureHotel(trimmed);
  return true;
}
