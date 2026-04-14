"use client";

import React from "react";
import Image from "next/image";

export const SocialProof = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`review-badge flex items-center gap-4 ${className}`}>
      <div className="flex -space-x-3 isolate">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full border-2 border-background shadow-sm overflow-hidden bg-[#E7D4B5] flex items-center justify-center relative z-0"
            style={{ zIndex: 5 - i }}
          >
            <Image
              src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${['Mimi', 'Jasper', 'Sheba', 'Bear'][i - 1]}`}
              alt="User avatar"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <span className="font-body text-sm text-odilon-heading font-medium tracking-wide">
        Join 300+ painting lovers.
      </span>
    </div>
  );
};
