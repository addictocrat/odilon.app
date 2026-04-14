"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthFormError } from "@/components/auth/AuthFormError";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPasswordAction, undefined);

  if (state?.success) {
    return (
      <AuthCard title="Check your email">
        <div className="space-y-6 text-center">
          <p className="font-body text-odilon-logo/80">
            {state.message}
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="text-odilon-logo font-header text-sm hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all"
            >
              Back to login
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard 
      title="Reset password" 
      description="Enter your email address and we'll send you a recovery link."
    >
      <form action={action} className="space-y-6">
        <AuthFormError message={state?.message} />
        
        <div className="space-y-4">
          <AuthInput
            id="email"
            name="email"
            type="email"
            label="email address"
            placeholder="email@example.com"
            required
            errors={state?.errors?.email}
          />
        </div>

        <AuthButton label="send reset link" pending={pending} />

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs font-body text-odilon-logo/60 hover:text-odilon-logo hover:underline transition-all"
          >
            Remembered your password? Log in
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
