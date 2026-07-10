import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { HR_SESSION_COOKIE, LEARNER_COOKIE } from "@/lib/db/config";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-only-session-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export type HrSessionPayload = {
  accountId: string;
  hotelId: string;
  hotelName: string;
  username: string;
  displayName: string;
  exp: number;
};

export function createHrSessionToken(payload: Omit<HrSessionPayload, "exp">): string {
  const full: HrSessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyHrSessionToken(token: string): HrSessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as HrSessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getLearnerIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(LEARNER_COOKIE)?.value ?? null;
}

export async function setLearnerCookie(learnerId: string): Promise<void> {
  const jar = await cookies();
  jar.set(LEARNER_COOKIE, learnerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getHrSessionFromCookies(): Promise<HrSessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(HR_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyHrSessionToken(token);
}

export async function setHrSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(HR_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearHrSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(HR_SESSION_COOKIE);
}

export function getLearnerIdFromRequest(req: NextRequest): string | null {
  return req.cookies.get(LEARNER_COOKIE)?.value ?? null;
}

export function getHrSessionFromRequest(req: NextRequest): HrSessionPayload | null {
  const token = req.cookies.get(HR_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyHrSessionToken(token);
}

export function hashPassword(password: string): string {
  const salt = createHash("sha256").update(getSessionSecret()).digest("hex").slice(0, 16);
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const expected = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  try {
    const a = Buffer.from(hash);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function slugifyHotel(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .slice(0, 80) || `hotel-${Date.now()}`;
}
