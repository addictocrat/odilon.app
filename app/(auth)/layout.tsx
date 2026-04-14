import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#483434" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
      
      {/* Footer footer */}
      <footer className="relative z-10 mt-12">
        <p className="font-body text-[10px] tracking-[0.2em] text-odilon-logo opacity-40 uppercase">
          © {new Date().getFullYear()} odilon — the art of conversation
        </p>
      </footer>
    </div>
  );
}
