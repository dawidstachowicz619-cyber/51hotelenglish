const LEARNER_EMAIL_DOMAIN = "learner.51hotelenglish.com";

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function extractMainlandPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "").replace(/^86/, "");
  return /^1\d{10}$/.test(digits) ? digits : null;
}

export function accountToAuthEmail(account: string): string {
  const trimmed = account.trim();
  if (!trimmed) throw new Error("empty_account");

  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  const phone = extractMainlandPhone(trimmed);
  if (phone) {
    return `${phone}@${LEARNER_EMAIL_DOMAIN}`;
  }

  const username = normalizeUsername(trimmed);
  if (!username) throw new Error("invalid_account");
  return `${username}@${LEARNER_EMAIL_DOMAIN}`;
}

export function authEmailToAccountLabel(email: string | null | undefined): string | null {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!local) return email;
  if (domain === LEARNER_EMAIL_DOMAIN) {
    return extractMainlandPhone(local) ?? local;
  }
  return email;
}

export function isValidLoginAccount(account: string): boolean {
  const trimmed = account.trim();
  if (!trimmed) return false;
  if (trimmed.includes("@")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }
  if (extractMainlandPhone(trimmed)) return true;
  return normalizeUsername(trimmed).length >= 3;
}

export function isValidLoginPassword(password: string): boolean {
  return password.length >= 6;
}
