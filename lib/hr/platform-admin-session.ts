import {
  PLATFORM_ADMIN_DEMO_PASSWORD,
  PLATFORM_ADMIN_SESSION_KEY,
  type PlatformAdminSession,
} from "@/lib/types/hr-permissions";

export function loadPlatformAdminSession(): PlatformAdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PLATFORM_ADMIN_SESSION_KEY);
    return raw ? (JSON.parse(raw) as PlatformAdminSession) : null;
  } catch {
    return null;
  }
}

export function savePlatformAdminSession(): PlatformAdminSession {
  const session: PlatformAdminSession = {
    role: "platform-admin",
    loggedInAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(PLATFORM_ADMIN_SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearPlatformAdminSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(PLATFORM_ADMIN_SESSION_KEY);
  }
}

export function verifyPlatformAdminPassword(password: string): boolean {
  return password.trim() === PLATFORM_ADMIN_DEMO_PASSWORD;
}
