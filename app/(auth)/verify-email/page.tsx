"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailAction } from "@/app/actions/verify-email";
import { AuthCard } from "@/components/auth/AuthCard";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Invalid verification link.");
        setVerifying(false);
        return;
      }

      const result = await verifyEmailAction(token);
      if (result && !result.success) {
        setError(result.message || "An error occurred during verification.");
        setVerifying(false);
      }
    }

    verify();
  }, [token]);

  return (
    <AuthCard title={verifying ? "Verifying..." : error ? "Verification Failed" : "Verified"}>
      <div className="space-y-6 text-center">
        {verifying ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-12 h-12 border-4 border-odilon-accent/20 border-t-odilon-accent rounded-full animate-spin" />
            <p className="font-body text-odilon-logo/80">
              Please wait while we verify your email address.
            </p>
          </div>
        ) : error ? (
          <>
            <p className="font-body text-red-700">
              {error}
            </p>
            <div className="pt-4">
              <Link
                href="/signup"
                className="text-odilon-logo font-header text-sm hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all"
              >
                Try signing up again
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="font-body text-odilon-logo/80">
              Your email has been successfully verified. You are being redirected...
            </p>
            <div className="pt-4">
              <Link
                href="/dashboard"
                className="text-odilon-logo font-header text-sm hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all"
              >
                Go to dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="h-48 flex items-center justify-center">
        <div className="animate-pulse text-odilon-logo font-header lowercase tracking-widest">
          odilon loading...
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
