export async function hashClientPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`51he-learner-v1:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyClientPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashClientPassword(password);
  return hash === storedHash;
}
