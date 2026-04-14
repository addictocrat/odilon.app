"use client";

import React from "react";
import { AnimatedLogo } from "../AnimatedLogo";
import { LogoDescription } from "../LogoDescription";

interface HeroSectionProps {
  opacity: number;
  reverseTrigger: boolean;
  onScrollClick: () => void;
}

export const HeroSection = ({ opacity, reverseTrigger, onScrollClick }: HeroSectionProps) => {
  return (
    <>
      {/* Footer Navigation Hint */}
      <div 
        onClick={onScrollClick}
        className={`absolute bottom-16 z-10 flex flex-col items-center gap-6 group cursor-pointer transition-all duration-700 hover:gap-8 p-12 -m-12 ${opacity < 0.2 ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
      >
        <span className="font-body text-[10px] tracking-[0.5em] uppercase text-odilon-logo opacity-60">
          Scroll to Ascend
        </span>
        <div className="relative flex flex-col items-center">
          <div className="h-16 w-[1px] bg-gradient-to-b from-odilon-logo to-transparent opacity-20" />
          <div className="absolute bottom-0 w-1 h-1 bg-odilon-logo rounded-full group-hover:translate-y-2 transition-transform duration-500" />
        </div>
      </div>

      {/* Logo Section */}
      <div 
        style={{ opacity }} 
        className="relative z-[150] transition-transform duration-300 flex flex-col items-center px-6"
      >
        <AnimatedLogo reverseTrigger={reverseTrigger} />
        <div className="-mt-8"> {/* Negative margin to tuck under the logo better */}
          <LogoDescription />
        </div>
      </div>
    </>
  );
};
