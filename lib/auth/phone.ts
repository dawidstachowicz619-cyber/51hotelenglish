/** Normalize mainland phone to E.164 for Supabase Auth (+86). */
export function toE164Phone(phone: string): string {
  const digits = phone.trim().replace(/\s|-/g, "").replace(/^\+86/, "");
  if (!/^1\d{10}$/.test(digits)) {
    throw new Error("invalid_phone");
  }
  return `+86${digits}`;
}

export function fromE164Phone(e164: string): string {
  return e164.replace(/^\+86/, "");
}

export function isValidMainlandPhone(phone: string): boolean {
  try {
    toE164Phone(phone);
    return true;
  } catch {
    return false;
  }
}
