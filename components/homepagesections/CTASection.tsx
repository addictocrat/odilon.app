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
      style={{ opacity, backgroundColor: "#483434" }}
    >
      <MasonryGrid opacity={opacity} />

      <div className="relative group pointer-events-auto cursor-pointer mt-12 md:mt-24">
        {/* Decorative ambient glow */}
        <div className="absolute -inset-4 bg-odilon-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <button 
          onClick={() => router.push("/signup")}
          className="relative flex items-center gap-4 px-10 py-5 bg-[#EBEBEB] rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.2),0_10px_20px_rgba(0,0,0,0.15)] transition-all duration-500 hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_15px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 group border-t border-white/50"
        >
          <span className="font-header text-2xl text-odilon-heading tracking-tight">
            Join now
          </span>
          <div className="relative overflow-hidden w-6 h-6">
            <MoveRight 
              className="w-full h-full text-odilon-heading transition-transform duration-500 group-hover:translate-x-1" 
            />
          </div>
        </button>
      </div>
    </div>
  );
};
