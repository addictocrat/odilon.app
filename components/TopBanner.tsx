"use client";

import React from "react";
import { logoutAction } from "@/app/actions/auth";

interface TopBannerProps {
  isAuthenticated?: boolean;
}

export const TopBanner = ({ isAuthenticated = false }: TopBannerProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center items-center pointer-events-none p-2 sm:p-3">
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
