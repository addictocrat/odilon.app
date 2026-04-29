"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

interface TopBannerProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

export const TopBanner = ({ isAuthenticated = false, isAdmin = false }: TopBannerProps) => {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isChat = pathname.startsWith("/chat");
  const isLibrary = pathname.startsWith("/paintings");
  const showOdilonRight = isDashboard || isChat || isLibrary;

  return (
    <nav className={`fixed top-0 right-0 z-[100] flex justify-center items-center pointer-events-none px-2 py-1.5 sm:px-3 sm:py-2 backdrop-blur-sm ${isChat ? "left-0 lg:left-80" : "left-0"} ${isLanding ? "bg-[#F6E6CB]/60" : "bg-[#F6E6CB]/75 border-b border-odilon-logo/5"}`}>
      {!showOdilonRight && (
        <button
          className="pointer-events-auto absolute left-0 flex items-center px-2 py-1.5 sm:px-3 sm:py-2 font-logo text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out cursor-pointer"
          onClick={() => { window.location.href = "/"; }}
        >
          odilon
        </button>
      )}
      <button
        className="hidden sm:block pointer-events-auto font-body text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out cursor-pointer"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        odilon studies how AI should be used in art
      </button>
      <div className="pointer-events-auto absolute right-0 flex gap-2 sm:gap-3 p-2 sm:p-3">
        {isAuthenticated ? (
          <>
            {showOdilonRight && (
              <button
                className="font-logo text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out cursor-pointer"
                onClick={() => { window.location.href = "/"; }}
              >
                odilon
              </button>
            )}
            {isAdmin && (
              <button
                className="font-body text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out cursor-pointer"
                onClick={() => {
                  window.location.href = "/analytics";
                }}
              >
                analytics
              </button>
            )}
            <button
              className="font-body text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out cursor-pointer"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              dashboard
            </button>
            <form action={logoutAction} className="flex items-center">
              <button
                type="submit"
                className="font-body text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out cursor-pointer"
              >
                log out
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              className="font-body text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out cursor-pointer"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              sign in
            </button>
            <button
              className="font-body text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out cursor-pointer"
              onClick={() => {
                window.location.href = "/signup";
              }}
            >
              sign up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
