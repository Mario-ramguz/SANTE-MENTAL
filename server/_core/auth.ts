import bcrypt from "bcryptjs";
import * as db from "../db";
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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
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

  const result = await database
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  return result[0] ?? null;
}

export async function registerUser(email: string, password: string, name: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  // Check if email already exists
  const existing = await database
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);
  const openId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  await database.insert(users).values({
    openId,
    email,
    name,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });

  // Store password hash separately in preferences or as openId trick
  // We use openId field to store hash prefixed so we can retrieve it
  const newUser = await database
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!newUser[0]) throw new Error("User creation failed");

  // Update openId to include password hash encoded
  const userId = newUser[0].id;
  await database
    .update(users)
    .set({ openId: `local_${userId}_${passwordHash}` })
    .where(eq(users.id, userId));

  return newUser[0];
}

export async function loginUser(email: string, password: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!result[0]) throw new Error("Invalid email or password");

  const user = result[0];

  // Extract hash from openId field
  const openId = user.openId;
  if (!openId.startsWith("local_")) throw new Error("Invalid email or password");

  // Format: local_userId_hash
  const parts = openId.split("_");
  if (parts.length < 3) throw new Error("Invalid email or password");

  // Hash is everything after "local_userId_"
  const hashStart = `local_${parts[1]}_`;
  const hash = openId.slice(hashStart.length);

  const valid = await verifyPassword(password, hash);
  if (!valid) throw new Error("Invalid email or password");

  // Update last signed in
  await database
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return user;
}
