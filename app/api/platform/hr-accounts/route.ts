import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/session";
import { isCloudStorageEnabled } from "@/lib/db/config";
import {
  createHrAccount,
  deleteHrAccount,
  isHrUsernameTaken,
  listHrAccountsByHotel,
  updateHrAccount,
} from "@/lib/db/repositories/hr-accounts";
import type {
  CreateHrAdminAccountInput,
  UpdateHrAdminAccountInput,
} from "@/lib/types/hr-admin-account";

function assertPlatformAdmin(request: Request): boolean {
  return (
    request.headers.get("x-platform-admin-password") ===
    process.env.PLATFORM_ADMIN_PASSWORD
  );
}

function validatePhone(phone: string | undefined): string | null {
  if (!phone?.trim()) return null;
  const normalized = phone.trim().replace(/\s|-/g, "").replace(/^\+86/, "");
  if (!/^1\d{10}$/.test(normalized)) {
    return "请输入 11 位中国大陆手机号";
  }
  return null;
}

function validateCreateInput(body: CreateHrAdminAccountInput): string | null {
  if (!body.hotel?.trim() || !body.username?.trim() || !body.displayName?.trim()) {
    return "请填写完整信息";
  }
  if (body.username.trim().length < 3) return "登录账号至少 3 个字符";
  if (!body.password || body.password.length < 6) return "密码至少 6 位";
  return validatePhone(body.phone);
}

function validateUpdateInput(body: UpdateHrAdminAccountInput): string | null {
  if (body.username !== undefined && body.username.trim().length < 3) {
    return "登录账号至少 3 个字符";
  }
  if (body.password !== undefined && body.password.length > 0 && body.password.length < 6) {
    return "密码至少 6 位";
  }
  if (body.displayName !== undefined && !body.displayName.trim()) {
    return "请填写管理员姓名";
  }
  return validatePhone(body.phone);
}

export async function GET(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }
  if (!assertPlatformAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hotel = new URL(request.url).searchParams.get("hotel")?.trim();
  if (!hotel) {
    return NextResponse.json({ error: "Missing hotel" }, { status: 400 });
  }

  try {
    const accounts = await listHrAccountsByHotel(hotel);
    return NextResponse.json({ accounts });
  } catch (err) {
    console.error("[platform/hr-accounts GET]", err);
    return NextResponse.json({ error: "Failed to load accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }
  if (!assertPlatformAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateHrAdminAccountInput;
    const validationError = validateCreateInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    if (await isHrUsernameTaken(body.username)) {
      return NextResponse.json({ error: "该登录账号已被使用" }, { status: 400 });
    }

    const account = await createHrAccount({
      ...body,
      passwordHash: hashPassword(body.password),
    });
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[platform/hr-accounts POST]", err);
    return NextResponse.json({ error: "Create account failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }
  if (!assertPlatformAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as UpdateHrAdminAccountInput & { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Missing account id" }, { status: 400 });
    }

    const validationError = validateUpdateInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (body.username && (await isHrUsernameTaken(body.username, body.id))) {
      return NextResponse.json({ error: "该登录账号已被使用" }, { status: 400 });
    }

    const account = await updateHrAccount(body.id, body);
    if (!account) {
      return NextResponse.json({ error: "账号不存在" }, { status: 404 });
    }
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[platform/hr-accounts PATCH]", err);
    return NextResponse.json({ error: "Update account failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isCloudStorageEnabled()) {
    return NextResponse.json({ error: "Cloud storage disabled" }, { status: 503 });
  }
  if (!assertPlatformAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing account id" }, { status: 400 });
  }

  try {
    await deleteHrAccount(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[platform/hr-accounts DELETE]", err);
    return NextResponse.json({ error: "Delete account failed" }, { status: 500 });
  }
}
