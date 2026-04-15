"use client";

import React from "react";
import { Painting } from "@/lib/db/schema";
import { PaintingCard } from "./PaintingCard";

interface MasonryGridProps {
  paintings: Painting[];
}

export function MasonryGrid({ paintings }: MasonryGridProps) {
  if (paintings.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-1000 px-4 text-center">
        <h2 className="font-header text-2xl text-odilon-logo uppercase tracking-widest opacity-30">
          The sanctuary is silent
        </h2>
        <p className="font-body text-sm text-odilon-logo/40 max-w-md mx-auto">
          We couldn't find any masterpieces matching your vision. Try searching
          for a different artist or title.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-12 py-6 sm:py-12">
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-6">
        {paintings.map((painting) => (
          <PaintingCard key={painting.id} painting={painting} />
        ))}
      </div>
    </div>
  );
}
