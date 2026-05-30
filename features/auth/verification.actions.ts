'use server'

import { db } from "@/lib/db";
import { verification_tokens, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function createVerificationToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

  await db.insert(verification_tokens).values({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  return token;
}

export async function verifyToken(token: string) {
  const record = await db.query.verification_tokens.findFirst({
    where: eq(verification_tokens.token, token),
  });

  if (!record || record.expires_at < new Date()) {
    return { success: false, error: "Token tidak valid atau sudah kadaluarsa" };
  }

  await db.update(profiles)
    .set({ is_verified: true })
    .where(eq(profiles.id, record.user_id));

  await db.delete(verification_tokens).where(eq(verification_tokens.token, token));

  return { success: true };
}
