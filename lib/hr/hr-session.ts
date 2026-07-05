import type { HrAdminAccount } from "@/lib/types/hr-admin-account";
import type { HrAdminSession } from "@/lib/types/hr-admin";

const SESSION_KEY = "51he-hr-admin-session";

export function loadHrSession(): HrAdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as HrAdminSession) : null;
  } catch {
    return null;
  }
}

export function saveHrSession(account: HrAdminAccount): HrAdminSession {
  const session: HrAdminSession = {
    hotel: account.hotel,
    accountId: account.id,
    username: account.username,
    displayName: account.displayName,
    loggedInAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearHrSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
