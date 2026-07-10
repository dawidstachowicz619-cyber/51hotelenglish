import { NextResponse } from "next/server";

import { getLearnerIdFromCookies, setLearnerCookie } from "@/lib/auth/session";
import { fromE164Phone } from "@/lib/auth/phone";
import { isCloudStorageEnabled } from "@/lib/db/config";
import { linkAuthUserToLearner } from "@/lib/db/repositories/profile-merge";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth";

export async function POST() {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const phone = data.user.phone ? fromE164Phone(data.user.phone) : undefined;
    const cookieLearnerId = await getLearnerIdFromCookies();
    const { learnerId, payload } = await linkAuthUserToLearner(
      data.user.id,
      cookieLearnerId,
      phone
    );

    await setLearnerCookie(learnerId);
    return NextResponse.json({ learnerId, ...payload, linked: true });
  } catch (err) {
    console.error("[auth/link]", err);
    return NextResponse.json({ error: "绑定失败" }, { status: 500 });
  }
}

export async function DELETE() {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/link DELETE]", err);
    return NextResponse.json({ error: "退出失败" }, { status: 500 });
  }
}
