"use client";

import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errors?: string[];
}

export function AuthInput({ label, errors, id, ...props }: AuthInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={id}
        className="text-odilon-logo font-header text-sm tracking-wide"
      >
        {label}
      </label>
      <input
        id={id}
        className="w-full px-4 py-2.5 bg-background border border-odilon-logo/10 rounded-md focus:outline-none focus:ring-1 focus:ring-odilon-accent focus:border-odilon-accent transition-all duration-300 font-body text-odilon-logo placeholder:text-odilon-logo/30"
        {...props}
      />
      {errors && errors.length > 0 && (
        <ul className="mt-1">
          {errors.map((error, index) => (
            <li key={index} className="text-red-700 text-xs font-body">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
