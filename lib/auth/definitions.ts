import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email").trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .trim(),
  confirmPassword: z.string().trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email").trim(),
  password: z.string().min(1, "Password is required").trim(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email").trim(),
});

export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .trim(),
  confirmPassword: z.string().trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}
