import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parseCookies } from "./cookies";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "serenite-secret-fallback-key-2024"
);

function hashPassword(password: string, salt?: string): string {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(s + password).digest("hex");
  return `${s}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = createHash("sha256").update(salt + password).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(attempt));
  } catch {
    return false;
  }
}

export async function createSessionToken(userId: number, name: string): Promise<string> {
  return new SignJWT({ userId, name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1y")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{ userId: number; name: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; name: string };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: Request) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const database = await getDb();
  if (!database) return null;
  const result = await database.select().from(users).where(eq(users.id, payload.userId)).limit(1);
  return result[0] ?? null;
}

export async function registerUser(email: string, password: string, name: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const existing = await database.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) throw new Error("Email already registered");

  const pwHash = hashPassword(password);
  const tempOpenId = `local_${Date.now()}_${randomBytes(8).toString("hex")}`;

  await database.insert(users).values({
    openId: tempOpenId,
    email,
    name,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });

  const newUser = await database.select().from(users).where(eq(users.email, email)).limit(1);
  if (!newUser[0]) throw new Error("User creation failed");

  // Store password hash in openId field: local_{id}_{hash}
  await database.update(users)
    .set({ openId: `local_${newUser[0].id}_${pwHash}` })
    .where(eq(users.id, newUser[0].id));

  return newUser[0];
}

export async function loginUser(email: string, password: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database.select().from(users).where(eq(users.email, email)).limit(1);
  if (!result[0]) throw new Error("Invalid email or password");

  const user = result[0];
  const openId = user.openId;

  if (!openId.startsWith("local_")) throw new Error("Invalid email or password");

  // Format: local_{userId}_{salt}:{hash}
  const prefixEnd = openId.indexOf("_", 6) + 1; // after "local_{id}_"
  const storedHash = openId.slice(prefixEnd);

  if (!verifyPassword(password, storedHash)) throw new Error("Invalid email or password");

  await database.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return user;
}
