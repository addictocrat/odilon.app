"use client";

import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AuthCard({ children, title, description }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-odilon-card p-10 sm:p-12 shadow-2xl relative overflow-hidden group">
      {/* Decorative border */}
      <div className="absolute inset-2 border border-odilon-logo/5 pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-logo text-4xl text-odilon-logo tracking-tight lowercase">
            odilon
          </h1>
          <div className="space-y-1">
            <h2 className="font-header text-2xl text-odilon-logo">
              {title}
            </h2>
            {description && (
              <p className="font-body text-odilon-logo/70 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>

        {children}
      </div>

      {/* Subtle corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-odilon-accent/5 -mb-8 -mr-8 rounded-full blur-2xl group-hover:bg-odilon-accent/10 transition-all duration-700" />
    </div>
  );
}
