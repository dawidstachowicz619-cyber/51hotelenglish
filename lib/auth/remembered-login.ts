const ACCOUNT_KEY = "51he-last-login-account";
const PHONE_KEY = "51he-last-login-phone";

export function getRememberedLoginAccount(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACCOUNT_KEY)?.trim() ?? "";
}

export function saveRememberedLoginAccount(account: string): void {
  if (typeof window === "undefined") return;
  const trimmed = account.trim();
  if (!trimmed) return;
  localStorage.setItem(ACCOUNT_KEY, trimmed);

  const digits = trimmed.replace(/\D/g, "").replace(/^86/, "");
  if (/^1\d{10}$/.test(digits)) {
    localStorage.setItem(PHONE_KEY, digits);
  }
}

export function getRememberedPhone(): string {
  if (typeof window === "undefined") return "";
  const fromAccount = getRememberedLoginAccount();
  const accountDigits = fromAccount.replace(/\D/g, "").replace(/^86/, "");
  if (/^1\d{10}$/.test(accountDigits)) return accountDigits;

  const raw = localStorage.getItem(PHONE_KEY)?.replace(/\D/g, "") ?? "";
  if (raw.length === 11) return raw;
  if (raw.length === 13 && raw.startsWith("86")) return raw.slice(2);
  return "";
}

export function saveRememberedPhone(phone: string): void {
  if (typeof window === "undefined") return;
  const normalized = phone.replace(/\s|-/g, "").replace(/^\+86/, "");
  if (/^1\d{10}$/.test(normalized)) {
    localStorage.setItem(PHONE_KEY, normalized);
    localStorage.setItem(ACCOUNT_KEY, normalized);
  }
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^86/, "");
  if (digits.length >= 7) {
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
  }
  const trimmed = phone.trim();
  return trimmed || "学员";
}
