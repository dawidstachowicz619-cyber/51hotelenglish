import { NextResponse } from "next/server";

import { getHrSessionFromCookies } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import { historyRowToEntry } from "@/lib/db/mappers";
import { findHotelByName } from "@/lib/db/repositories/hotels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const session = await getHrSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employeeId = new URL(request.url).searchParams.get("employeeId")?.trim();
  if (!employeeId) {
    return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
  }

  try {
    const hotel = await findHotelByName(session.hotelName);
    if (!hotel) {
      return NextResponse.json({ history: [] });
    }

    const db = getSupabaseAdmin();
    const { data: employee } = await db
      .from("employees")
      .select("id, legacy_id, learner_profile_id, phone")
      .eq("hotel_id", hotel.id)
      .or(`id.eq.${employeeId},legacy_id.eq.${employeeId}`)
      .maybeSingle();

    if (!employee?.learner_profile_id) {
      return NextResponse.json({ history: [] });
    }

    const { data: rows, error } = await db
      .from("learning_history")
      .select("*")
      .eq("learner_id", employee.learner_profile_id)
      .order("occurred_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    return NextResponse.json({
      history: (rows ?? []).map(historyRowToEntry),
    });
  } catch (err) {
    console.error("[hr/learning-history GET]", err);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}
