import { hashClientPassword, verifyClientPassword } from "@/lib/auth/client-password";
import { extractMainlandPhone } from "@/lib/auth/learner-account";

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

const SESSION_KEY = "51he-learner-local-session";
const ACCOUNTS_KEY = "51he-learner-local-accounts";

export type LocalLearnerSession = {
  username: string;
  realName: string;
  nickname: string;
  phone: string | null;
};

type LocalLearnerAccount = {
  username: string;
  passwordHash: string;
  realName: string;
  nickname: string;
  phone: string | null;
};

function readAccounts(): Record<string, LocalLearnerAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LocalLearnerAccount>;
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, LocalLearnerAccount>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getLocalLearnerSession(): LocalLearnerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalLearnerSession;
  } catch {
    return null;
  }
}

function setLocalLearnerSession(session: LocalLearnerSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearLocalLearnerSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export async function registerLocalLearnerAccount(
  account: string,
  password: string,
  realName: string,
  nickname: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const username = normalizeUsername(account);
  const accounts = readAccounts();

  if (accounts[username]) {
    return { ok: false, error: "该账号已注册，请直接登录" };
  }

  const passwordHash = await hashClientPassword(password);
  const phone = extractMainlandPhone(account);

  accounts[username] = {
    username,
    passwordHash,
    realName: realName.trim(),
    nickname: nickname.trim(),
    phone,
  };
  writeAccounts(accounts);

  setLocalLearnerSession({
    username,
    realName: realName.trim(),
    nickname: nickname.trim(),
    phone,
  });

  return { ok: true };
}

export async function signInLocalLearnerAccount(
  account: string,
  password: string
): Promise<{ ok: true; session: LocalLearnerSession } | { ok: false; error: string }> {
  const username = normalizeUsername(
    account.includes("@") ? account.split("@")[0] ?? account : account
  );
  const accounts = readAccounts();
  const record = accounts[username];

  if (!record || !(await verifyClientPassword(password, record.passwordHash))) {
    return { ok: false, error: "账号或密码错误" };
  }

  const session: LocalLearnerSession = {
    username: record.username,
    realName: record.realName,
    nickname: record.nickname || record.realName,
    phone: record.phone,
  };
  setLocalLearnerSession(session);
  return { ok: true, session };
}

export function isLocalLearnerAuthEnabled(): boolean {
  return typeof window !== "undefined";
}
