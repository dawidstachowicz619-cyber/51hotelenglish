import { NextResponse } from "next/server";

import { isCloudStorageEnabled } from "@/lib/db/config";
import { listManagedHotelsCloud } from "@/lib/db/repositories/hr-permissions";
import { getAvailableHotels } from "@/lib/hr/demo-roster";
import { buildLearnerHotelOptions } from "@/lib/hr/learner-hotel-options";

export async function GET() {
  try {
    const adminHotels = isCloudStorageEnabled()
      ? await listManagedHotelsCloud()
      : getAvailableHotels();

    return NextResponse.json({ hotels: buildLearnerHotelOptions(adminHotels) });
  } catch (err) {
    console.error("[hotels GET]", err);
    return NextResponse.json({ hotels: buildLearnerHotelOptions([]) });
  }
}
