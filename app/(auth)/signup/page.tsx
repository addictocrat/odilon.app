"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthFormError } from "@/components/auth/AuthFormError";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUpAction, undefined);

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
      title="Create account" 
      description="Join the sanctuary of art and start the conversation."
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
          <AuthInput
            id="password"
            name="password"
            type="password"
            label="password"
            placeholder="••••••••"
            required
            errors={state?.errors?.password}
          />
          <AuthInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="confirm password"
            placeholder="••••••••"
            required
            errors={state?.errors?.confirmPassword}
          />
        </div>

        <AuthButton label="sign up" pending={pending} />

        <div className="text-center pt-2">
          <p className="font-body text-xs text-odilon-logo/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-odilon-logo font-header hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all"
            >
              Log in
            </Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
