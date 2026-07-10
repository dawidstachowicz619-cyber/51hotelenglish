import type {
  CreateHrAdminAccountInput,
  HrAdminAccount,
  UpdateHrAdminAccountInput,
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

function normalizePhone(phone: string | undefined): string | undefined {
  const trimmed = phone?.trim().replace(/\s|-/g, "").replace(/^\+86/, "") ?? "";
  return trimmed || undefined;
}

function validatePhone(phone: string | undefined): string | null {
  if (!phone?.trim()) return null;
  const normalized = normalizePhone(phone) ?? "";
  if (!/^1\d{10}$/.test(normalized)) {
    return "请输入 11 位中国大陆手机号";
  }
  return null;
}

function validateAccountFields(input: {
  username: string;
  displayName: string;
  password?: string;
  phone?: string;
}): string | null {
  const username = input.username.trim();
  const displayName = input.displayName.trim();

  if (!username || !displayName) {
    return "请填写完整信息";
  }
  if (username.length < 3) {
    return "登录账号至少 3 个字符";
  }
  if (input.password !== undefined && input.password.length > 0 && input.password.length < 6) {
    return "密码至少 6 位";
  }
  return validatePhone(input.phone);
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

  const validationError = validateAccountFields({
    username,
    displayName,
    password: input.password,
    phone: input.phone,
  });
  if (validationError) return { error: validationError };
  if (isUsernameTaken(username)) {
    return { error: "该登录账号已被使用" };
  }

  const now = new Date().toISOString();
  const account: HrAdminAccount = {
    id: `hr-admin-${Date.now().toString(36)}`,
    hotel,
    username,
    password: input.password,
    displayName,
    phone: normalizePhone(input.phone),
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
  patch: UpdateHrAdminAccountInput
): { account: HrAdminAccount } | { error: string } {
  const accounts = loadAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index < 0) return { error: "账号不存在" };

  const current = accounts[index];
  const username = patch.username !== undefined ? patch.username.trim() : current.username;
  const displayName =
    patch.displayName !== undefined ? patch.displayName.trim() : current.displayName;
  const phone = patch.phone !== undefined ? normalizePhone(patch.phone) : current.phone;

  const validationError = validateAccountFields({
    username,
    displayName,
    password: patch.password,
    phone,
  });
  if (validationError) return { error: validationError };

  if (isUsernameTaken(username, id)) {
    return { error: "该登录账号已被使用" };
  }

  const next: HrAdminAccount = {
    ...current,
    username,
    displayName,
    phone,
    email: patch.email !== undefined ? patch.email.trim() || undefined : current.email,
    enabled: patch.enabled !== undefined ? patch.enabled : current.enabled,
    password: patch.password ? patch.password : current.password,
    updatedAt: new Date().toISOString(),
  };

  accounts[index] = next;
  saveAccounts(accounts);
  return { account: next };
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
