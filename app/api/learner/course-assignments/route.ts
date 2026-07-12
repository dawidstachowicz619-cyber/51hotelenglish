import { NextResponse } from "next/server";

import { isCloudStorageEnabled } from "@/lib/db/config";
import { listHotelCourseAssignments } from "@/lib/db/repositories/course-assignments";

export async function GET(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const hotel = new URL(request.url).searchParams.get("hotel")?.trim();
  if (!hotel) {
    return NextResponse.json({ error: "Missing hotel" }, { status: 400 });
  }

  try {
    const assignments = await listHotelCourseAssignments(hotel);
    return NextResponse.json({ assignments });
  } catch (err) {
    console.error("[learner/course-assignments GET]", err);
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
  }
}
