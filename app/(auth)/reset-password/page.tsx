"use client";

import React, { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthFormError } from "@/components/auth/AuthFormError";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);

  if (!token) {
    return (
      <AuthCard title="Invalid Link">
        <p className="font-body text-odilon-logo/80 text-center">
          This password reset link is invalid or has expired.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard 
      title="New password" 
      description="Create a strong password to protect your account."
    >
      <form action={action} className="space-y-6">
        <AuthFormError message={state?.message} />
        
        {/* Hidden field for token */}
        <input type="hidden" name="token" value={token} />
        
        <div className="space-y-4">
          <AuthInput
            id="password"
            name="password"
            type="password"
            label="new password"
            placeholder="••••••••"
            required
            errors={state?.errors?.password}
          />
          <AuthInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="confirm new password"
            placeholder="••••••••"
            required
            errors={state?.errors?.confirmPassword}
          />
        </div>

        <AuthButton label="reset password" pending={pending} />
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="h-48 flex items-center justify-center">
        <div className="animate-pulse text-odilon-logo font-header lowercase tracking-widest">
          odilon loading...
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
