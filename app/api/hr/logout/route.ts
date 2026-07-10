import { NextResponse } from "next/server";

import { clearHrSessionCookie } from "@/lib/auth/session";

export async function POST() {
  await clearHrSessionCookie();
  return NextResponse.json({ ok: true });
}
