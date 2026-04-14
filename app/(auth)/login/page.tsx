"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthFormError } from "@/components/auth/AuthFormError";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <AuthCard 
      title="Welcome back" 
      description="Enter your credentials to enter the gallery."
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
          <div className="space-y-1">
            <AuthInput
              id="password"
              name="password"
              type="password"
              label="password"
              placeholder="••••••••"
              required
              errors={state?.errors?.password}
            />
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-[10px] uppercase tracking-wider text-odilon-logo/50 hover:text-odilon-logo hover:underline transition-all font-body"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <AuthButton label="log in" pending={pending} />

        <div className="text-center pt-2">
          <p className="font-body text-xs text-odilon-logo/60">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-odilon-logo font-header hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
