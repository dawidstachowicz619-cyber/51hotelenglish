import { ensureHotel, findHotelByName } from "@/lib/db/repositories/hotels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  DEFAULT_HOTEL_DEPARTMENTS,
  type HotelDepartment,
} from "@/lib/types/hotel-department";

export async function listHotelDepartmentsCloud(
  hotelName: string
): Promise<HotelDepartment[] | null> {
  const hotel = await findHotelByName(hotelName.trim());
  if (!hotel) return null;

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("hotel_departments")
    .select("departments")
    .eq("hotel_id", hotel.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const departments = data.departments as HotelDepartment[];
  return [...departments].sort((a, b) => a.order - b.order);
}

export async function saveHotelDepartmentsCloud(
  hotelName: string,
  departments: HotelDepartment[]
): Promise<HotelDepartment[]> {
  const hotel = await ensureHotel(hotelName.trim());
  const normalized = departments.map((d, index) => ({ ...d, order: index }));

  const db = getSupabaseAdmin();
  const { error } = await db.from("hotel_departments").upsert(
    {
      hotel_id: hotel.id,
      departments: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "hotel_id" }
  );
  if (error) throw error;
  return normalized;
}

export async function migrateHotelDepartmentsCloud(
  hotelName: string,
  localDepartments: HotelDepartment[]
): Promise<HotelDepartment[]> {
  const existing = await listHotelDepartmentsCloud(hotelName);
  if (existing && existing.length > 0) return existing;
  if (localDepartments.length === 0) return DEFAULT_HOTEL_DEPARTMENTS.map((d) => ({ ...d }));
  return saveHotelDepartmentsCloud(hotelName, localDepartments);
}

export async function deleteHotelDepartmentsCloud(hotelName: string): Promise<void> {
  const hotel = await findHotelByName(hotelName.trim());
  if (!hotel) return;
  const db = getSupabaseAdmin();
  const { error } = await db.from("hotel_departments").delete().eq("hotel_id", hotel.id);
  if (error) throw error;
}
