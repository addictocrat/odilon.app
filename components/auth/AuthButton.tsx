"use client";

import React from "react";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  pending?: boolean;
}

export function AuthButton({ label, pending, className, ...props }: AuthButtonProps) {
  return (
    <button
      disabled={pending}
      className={`
        w-full py-3 px-6 bg-odilon-button text-odilon-logo font-header tracking-widest text-sm uppercase
        hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300 shadow-sm
        ${className}
      `}
      {...props}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
