import { hashPassword, normalizeUsername, verifyPassword } from "@/lib/auth/session";
import { findHotelById, ensureHotel } from "@/lib/db/repositories/hotels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { HrAdminAccountRow } from "@/lib/supabase/database.types";
import type {
  CreateHrAdminAccountInput,
  HrAdminAccount,
  UpdateHrAdminAccountInput,
} from "@/lib/types/hr-admin-account";

function rowToAccount(row: HrAdminAccountRow, hotelName: string): HrAdminAccount {
  return {
    id: row.id,
    hotel: hotelName,
    username: row.username,
    password: "",
    displayName: row.display_name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    enabled: row.enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizePhone(phone: string | undefined): string | null {
  const trimmed = phone?.trim().replace(/\s|-/g, "").replace(/^\+86/, "") ?? "";
  return trimmed || null;
}

export async function isHrUsernameTaken(
  username: string,
  exceptId?: string
): Promise<boolean> {
  const db = getSupabaseAdmin();
  const key = normalizeUsername(username);
  const { data, error } = await db
    .from("hr_admin_accounts")
    .select("id")
    .eq("username", key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  return data.id !== exceptId;
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

export async function createHrAccount(
  input: Omit<CreateHrAdminAccountInput, "password"> & { passwordHash: string }
): Promise<HrAdminAccount> {
  const hotel = await ensureHotel(input.hotel);
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("hr_admin_accounts")
    .insert({
      hotel_id: hotel.id,
      username: normalizeUsername(input.username),
      password_hash: input.passwordHash,
      display_name: input.displayName.trim(),
      phone: normalizePhone(input.phone),
      email: input.email?.trim() || null,
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
    .eq("hotel_id", hotel.id)
    .order("display_name");
  if (error) throw error;
  return (data ?? []).map((row) => rowToAccount(row, hotel.name));
}

export async function updateHrAccount(
  id: string,
  patch: UpdateHrAdminAccountInput
): Promise<HrAdminAccount | null> {
  const db = getSupabaseAdmin();
  const { data: existing, error: loadError } = await db
    .from("hr_admin_accounts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (loadError) throw loadError;
  if (!existing) return null;

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.username !== undefined) {
    payload.username = normalizeUsername(patch.username);
  }
  if (patch.displayName !== undefined) {
    payload.display_name = patch.displayName.trim();
  }
  if (patch.phone !== undefined) {
    payload.phone = normalizePhone(patch.phone);
  }
  if (patch.email !== undefined) {
    payload.email = patch.email.trim() || null;
  }
  if (patch.enabled !== undefined) {
    payload.enabled = patch.enabled;
  }
  if (patch.password) {
    payload.password_hash = hashPassword(patch.password);
  }

  const { data, error } = await db
    .from("hr_admin_accounts")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;

  const hotelRow = await findHotelById(data.hotel_id);
  return rowToAccount(data, hotelRow?.name ?? "");
}

export async function deleteHrAccount(id: string): Promise<boolean> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("hr_admin_accounts").delete().eq("id", id);
  if (error) throw error;
  return true;
}
