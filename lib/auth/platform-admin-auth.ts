import { PLATFORM_ADMIN_DEMO_PASSWORD } from "@/lib/types/hr-permissions";

export function getExpectedPlatformAdminPassword(): string {
  const configured = process.env.PLATFORM_ADMIN_PASSWORD?.trim();
  return configured || PLATFORM_ADMIN_DEMO_PASSWORD;
}

export function verifyPlatformAdminPassword(password: string | null | undefined): boolean {
  if (!password?.trim()) return false;
  return password.trim() === getExpectedPlatformAdminPassword();
}

export function verifyPlatformAdminRequest(request: Request): boolean {
  return verifyPlatformAdminPassword(request.headers.get("x-platform-admin-password"));
}
