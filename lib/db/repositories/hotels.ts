import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { slugifyHotel } from "@/lib/auth/session";
import type { HotelRow } from "@/lib/supabase/database.types";

export async function findHotelByName(name: string): Promise<HotelRow | null> {
  const db = getSupabaseAdmin();
  const trimmed = name.trim();
  const { data, error } = await db
    .from("hotels")
    .select("*")
    .eq("name", trimmed)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function ensureHotel(name: string): Promise<HotelRow> {
  const existing = await findHotelByName(name);
  if (existing) return existing;

  const db = getSupabaseAdmin();
  const slug = slugifyHotel(name);
  const { data, error } = await db
    .from("hotels")
    .insert({ name: name.trim(), slug })
    .select("*")
    .single();
  if (error) {
    const retry = await findHotelByName(name);
    if (retry) return retry;
    throw error;
  }
  return data;
}

export async function listHotels(): Promise<HotelRow[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("hotels").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function findHotelById(id: string): Promise<HotelRow | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("hotels")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
