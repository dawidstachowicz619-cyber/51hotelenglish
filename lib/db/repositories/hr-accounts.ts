import { normalizeUsername, verifyPassword } from "@/lib/auth/session";
import { findHotelById, ensureHotel } from "@/lib/db/repositories/hotels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { HrAdminAccountRow } from "@/lib/supabase/database.types";
import type { HrAdminAccount } from "@/lib/types/hr-admin-account";

function rowToAccount(row: HrAdminAccountRow, hotelName: string): HrAdminAccount {
  return {
    id: row.id,
    hotel: hotelName,
    username: row.username,
    password: "",
    displayName: row.display_name,
    email: row.email ?? undefined,
    enabled: row.enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function verifyHrLogin(
  username: string,
  password: string
): Promise<{ account: HrAdminAccount; hotelId: string } | null> {
  const db = getSupabaseAdmin();
  const key = normalizeUsername(username);
  const { data, error } = await db
    .from("hr_admin_accounts")
    .select("*")
    .eq("username", key)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.enabled) return null;
  if (!verifyPassword(password, data.password_hash)) return null;

  const hotelRow = await findHotelById(data.hotel_id);
  const hotelName = hotelRow?.name ?? "";

  return {
    account: rowToAccount(data, hotelName),
    hotelId: data.hotel_id,
  };
}

export async function createHrAccount(input: {
  hotel: string;
  username: string;
  passwordHash: string;
  displayName: string;
  email?: string;
}): Promise<HrAdminAccount> {
  const hotel = await ensureHotel(input.hotel);
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("hr_admin_accounts")
    .insert({
      hotel_id: hotel.id,
      username: normalizeUsername(input.username),
      password_hash: input.passwordHash,
      display_name: input.displayName,
      email: input.email ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToAccount(data, hotel.name);
}

export async function listHrAccountsByHotel(hotelName: string): Promise<HrAdminAccount[]> {
  const hotel = await ensureHotel(hotelName);
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("hr_admin_accounts")
    .select("*")
    .eq("hotel_id", hotel.id);
  if (error) throw error;
  return (data ?? []).map((row) => rowToAccount(row, hotel.name));
}
