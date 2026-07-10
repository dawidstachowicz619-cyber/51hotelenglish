const STORAGE_KEY = "51he-last-login-phone";

export function getRememberedPhone(): string {
  if (typeof window === "undefined") return "";
  const raw = localStorage.getItem(STORAGE_KEY)?.replace(/\D/g, "") ?? "";
  if (raw.length === 11) return raw;
  if (raw.length === 13 && raw.startsWith("86")) return raw.slice(2);
  return "";
}

export function saveRememberedPhone(phone: string): void {
  if (typeof window === "undefined") return;
  const normalized = phone.replace(/\s|-/g, "").replace(/^\+86/, "");
  if (/^1\d{10}$/.test(normalized)) {
    localStorage.setItem(STORAGE_KEY, normalized);
  }
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^86/, "");
  if (digits.length < 7) return phone || "学员";
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}
