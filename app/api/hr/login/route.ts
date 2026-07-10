import { NextResponse } from "next/server";

import {
  createHrSessionToken,
  hashPassword,
  setHrSessionCookie,
} from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import { verifyHrLogin } from "@/lib/db/repositories/hr-accounts";

export async function POST(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };
    if (!username?.trim() || !password) {
      return NextResponse.json({ error: "请输入账号和密码" }, { status: 400 });
    }

    const result = await verifyHrLogin(username, password);
    if (!result) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    const token = createHrSessionToken({
      accountId: result.account.id,
      hotelId: result.hotelId,
      hotelName: result.account.hotel,
      username: result.account.username,
      displayName: result.account.displayName,
    });
    await setHrSessionCookie(token);

    return NextResponse.json({
      session: {
        hotel: result.account.hotel,
        accountId: result.account.id,
        username: result.account.username,
        displayName: result.account.displayName,
        loggedInAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[hr/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

/** Utility for seeding first HR account via API (protected by platform password header). */
export async function PUT(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }

  const adminPassword = request.headers.get("x-platform-admin-password");
  if (adminPassword !== process.env.PLATFORM_ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      hotel: string;
      username: string;
      password: string;
      displayName: string;
      phone?: string;
      email?: string;
    };

    const { createHrAccount } = await import("@/lib/db/repositories/hr-accounts");
    const account = await createHrAccount({
      hotel: body.hotel,
      username: body.username,
      passwordHash: hashPassword(body.password),
      displayName: body.displayName,
      phone: body.phone,
      email: body.email,
    });

    return NextResponse.json({ account: { ...account, password: undefined } });
  } catch (err) {
    console.error("[hr/login PUT]", err);
    return NextResponse.json({ error: "Create account failed" }, { status: 500 });
  }
}
