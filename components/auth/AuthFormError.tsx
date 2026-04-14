"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface AuthFormErrorProps {
  message?: string;
}

export function AuthFormError({ message }: AuthFormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-red-800 text-sm font-body animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
