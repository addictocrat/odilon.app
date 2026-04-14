"use server";

import { db } from "@/lib/db";
import {
  users,
  emailVerificationTokens,
  passwordResetTokens,
} from "@/lib/db/schema";
import {
  SignUpSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  FormState,
} from "@/lib/auth/definitions";
import { createSession, deleteSession } from "@/lib/auth/session";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/auth/email";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

export async function signUpAction(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
    };
  }

  const { name, email, password } = validatedFields.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return {
        message: "A user with this email already exists.",
      };
    }

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
      })
      .returning();

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    await sendVerificationEmail(email, token);

    return {
      success: true,
      message: "Check your email to verify your account.",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      message: "An error occurred during signup. Please try again.",
    };
  }
}

export async function loginAction(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return {
        message: "Invalid email or password.",
      };
    }

    if (!user.emailVerified) {
      return {
        message: "Please verify your email before logging in.",
      };
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordsMatch) {
      return {
        message: "Invalid email or password.",
      };
    }

    await createSession(user.id);
  } catch (error) {
    console.error("Login error:", error);
    return {
      message: "An error occurred during login. Please try again.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

export async function forgotPasswordAction(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ForgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
    };
  }

  const { email } = validatedFields.data;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      await sendPasswordResetEmail(email, token);
    }

    // Always return success to prevent email enumeration
    return {
      success: true,
      message: "If an account exists with that email, we've sent a reset link.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      message: "An error occurred. Please try again.",
    };
  }
}

export async function resetPasswordAction(state: FormState, formData: FormData): Promise<FormState> {
  const token = formData.get("token") as string;
  const validatedFields = ResetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
    };
  }

  const { password } = validatedFields.data;

  try {
    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return {
        message: "Invalid or expired reset token.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, resetToken.userId));

    await db.delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, resetToken.id));

    await createSession(resetToken.userId);
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      message: "An error occurred. Please try again.",
    };
  }

  redirect("/dashboard");
}
