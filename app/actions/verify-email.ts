"use server";

import { db } from "@/lib/db";
import { users, emailVerificationTokens } from "@/lib/db/schema";
import { createSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function verifyEmailAction(token: string) {
  try {
    const verificationToken = await db.query.emailVerificationTokens.findFirst({
      where: eq(emailVerificationTokens.token, token),
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return {
        success: false,
        message: "Invalid or expired verification token.",
      };
    }

    await db.update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, verificationToken.userId));

    await db.delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, verificationToken.id));

    await createSession(verificationToken.userId);
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      message: "An error occurred during verification.",
    };
  }

  redirect("/dashboard");
}
