import { ensureHotel } from "@/lib/db/repositories/hotels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LearnerProfileRow } from "@/lib/supabase/database.types";

export async function getLearnerById(id: string): Promise<LearnerProfileRow | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("learner_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createLearner(): Promise<LearnerProfileRow> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("learner_profiles")
    .insert({})
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getOrCreateLearner(id: string | null): Promise<LearnerProfileRow> {
  if (id) {
    const existing = await getLearnerById(id);
    if (existing) return existing;
  }
  return createLearner();
}

export async function updateLearner(
  id: string,
  patch: Partial<LearnerProfileRow>
): Promise<LearnerProfileRow> {
  const db = getSupabaseAdmin();

  if (patch.hotel_name?.trim()) {
    const hotel = await ensureHotel(patch.hotel_name.trim());
    patch.hotel_id = hotel.id;
  }

  const { data, error } = await db
    .from("learner_profiles")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function linkLearnerToEmployeeByPhone(
  learnerId: string,
  phone: string,
  hotelName: string
): Promise<boolean> {
  const normalized = phone.trim().replace(/\s|-/g, "").replace(/^\+86/, "");
  if (!normalized || !hotelName.trim()) return false;

  const hotel = await ensureHotel(hotelName.trim());
  const db = getSupabaseAdmin();

  const { data: employee, error } = await db
    .from("employees")
    .select("*")
    .eq("hotel_id", hotel.id)
    .eq("phone", normalized)
    .eq("is_imported", true)
    .maybeSingle();
  if (error) throw error;
  if (!employee) return false;

  await db
    .from("employees")
    .update({ learner_profile_id: learnerId })
    .eq("id", employee.id);

  await updateLearner(learnerId, {
    phone: normalized,
    hr_registered: true,
    hotel_id: hotel.id,
    hotel_name: hotel.name,
  });

  return true;
}
