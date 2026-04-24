"use client";

import React from "react";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { MasonryGrid } from "../animations/MasonryGrid";

export const CTASection = ({ opacity }: { opacity: number }) => {
  const router = useRouter();
  if (opacity <= 0) return null;

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 py-20"
      style={{ opacity }}
    >
      <MasonryGrid opacity={opacity} />

      <div className="relative flex flex-col md:flex-row items-center gap-6 mt-12 md:mt-24 pointer-events-auto">
        {/* Join Now Button */}
        <div className="relative group cursor-pointer">
          {/* Decorative ambient glow */}
          <div className="absolute -inset-4 bg-odilon-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <button 
            onClick={() => router.push("/signup")}
            className="relative flex items-center gap-4 px-8 py-3.5 bg-[#E7D4B5] rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.2),0_10px_20px_rgba(0,0,0,0.15)] transition-all duration-500 hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_15px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 group border-t border-white/30 cursor-pointer"
          >
            <span className="font-header text-2xl text-[#483434] tracking-tight">
              Join now
            </span>
            <div className="relative overflow-hidden w-6 h-6">
              <MoveRight 
                className="w-full h-full text-[#483434] transition-transform duration-500 group-hover:translate-x-1" 
              />
            </div>
          </button>
        </div>

        {/* Try Compass Link */}
        <div className="relative group cursor-pointer">
          {/* Subtle decorative glow */}
          <div className="absolute -inset-4 bg-odilon-accent/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <button 
            onClick={() => router.push("/compass/saved")}
            className="relative flex items-center gap-4 px-6 py-3 transition-all duration-500 hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <div className="relative w-12 h-12 shrink-0 overflow-hidden drop-shadow-lg">
               <img 
                src="/odilonicon.png" 
                alt="Odilon Compass" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-header text-2xl text-[#E7D4B5] tracking-tight hover:text-white transition-colors duration-300">
              Try Odilon Compass
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
