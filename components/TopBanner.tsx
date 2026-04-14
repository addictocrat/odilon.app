"use client";

import React from "react";

export const TopBanner = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none p-2 sm:p-3">
      <button 
        className="pointer-events-auto font-body text-[9px] sm:text-[10px] tracking-[0.2em] text-odilon-logo hover:text-odilon-logo hover:underline decoration-odilon-accent/30 underline-offset-4 transition-all duration-500 ease-out"
        onClick={() => {
          window.location.href = '/signup';
        }}
      >
        odilon studies how AI should be used in art
      </button>
    </nav>
  );
};
