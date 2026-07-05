import type {
  CreateHrAdminAccountInput,
  HrAdminAccount,
} from "@/lib/types/hr-admin-account";
import { HR_ADMIN_ACCOUNTS_KEY } from "@/lib/types/hr-admin-account";

function loadAccounts(): HrAdminAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HR_ADMIN_ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as HrAdminAccount[]) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: HrAdminAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HR_ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
  window.dispatchEvent(new Event("hr-admin-accounts-updated"));
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function getHrAccountsByHotel(hotel: string): HrAdminAccount[] {
  const key = hotel.trim();
  return loadAccounts()
    .filter((a) => a.hotel === key)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "zh-CN"));
}

export function getAllHrAdminAccounts(): HrAdminAccount[] {
  return loadAccounts();
}

export function getHrAdminAccountById(id: string): HrAdminAccount | undefined {
  return loadAccounts().find((a) => a.id === id);
}

export function isUsernameTaken(username: string, exceptId?: string): boolean {
  const key = normalizeUsername(username);
  return loadAccounts().some(
    (a) => normalizeUsername(a.username) === key && a.id !== exceptId
  );
}

export function generateHrAdminPassword(): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `Hr@${suffix}`;
}

export function createHrAdminAccount(
  input: CreateHrAdminAccountInput
): { account: HrAdminAccount } | { error: string } {
  const username = input.username.trim();
  const displayName = input.displayName.trim();
  const hotel = input.hotel.trim();

  if (!username || !displayName || !hotel) {
    return { error: "请填写完整信息" };
  }
  if (username.length < 3) {
    return { error: "登录账号至少 3 个字符" };
  }
  if (isUsernameTaken(username)) {
    return { error: "该登录账号已被使用" };
  }
  if (!input.password || input.password.length < 6) {
    return { error: "密码至少 6 位" };
  }

  const now = new Date().toISOString();
  const account: HrAdminAccount = {
    id: `hr-admin-${Date.now().toString(36)}`,
    hotel,
    username,
    password: input.password,
    displayName,
    email: input.email?.trim() || undefined,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  };

  const accounts = loadAccounts();
  accounts.push(account);
  saveAccounts(accounts);
  return { account };
}

export function updateHrAdminAccount(
  id: string,
  patch: Partial<
    Pick<HrAdminAccount, "displayName" | "email" | "enabled" | "password">
  >
): HrAdminAccount | null {
  const accounts = loadAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index < 0) return null;

  const next = {
    ...accounts[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  accounts[index] = next;
  saveAccounts(accounts);
  return next;
}

export function deleteHrAdminAccount(id: string): void {
  saveAccounts(loadAccounts().filter((a) => a.id !== id));
}

export function verifyHrAdminLogin(
  username: string,
  password: string
): HrAdminAccount | null {
  const key = normalizeUsername(username);
  const account = loadAccounts().find(
    (a) => normalizeUsername(a.username) === key
  );
  if (!account || !account.enabled) return null;
  if (account.password !== password) return null;
  return account;
}

export function countHrAccountsByHotel(hotel: string): number {
  return getHrAccountsByHotel(hotel).length;
}

export function countEnabledHrAccounts(): number {
  return loadAccounts().filter((a) => a.enabled).length;
}
