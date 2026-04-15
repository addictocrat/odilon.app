"use client";

import React, { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

import { PAINTINGS, getPaintingPath } from "@/lib/paintings";

export const MasonryGrid = ({ opacity }: { opacity: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    // Trigger animation when CTA becomes clearly visible
    if (opacity > 0.4 && !animatedRef.current && containerRef.current) {
      animatedRef.current = true;
      const items = containerRef.current.querySelectorAll(".grid-item");
      
      const isMobile = window.innerWidth < 768;
      const cols = isMobile ? 2 : 5;
      const rows = Math.ceil(PAINTINGS.length / cols);

      animate(Array.from(items), {
        scale: [0.9, 1],
        opacity: [0, 1],
        translateY: [40, 0],
        rotate: () => (Math.random() * 4 - 2), 
        duration: 1000,
        easing: "easeOutCubic",
        delay: stagger(60, { 
          grid: [cols, rows], 
          from: "first",
          axis: isMobile ? "y" : "x" 
        }),
      });
    }
    
    // Reset more reliably
    if (opacity < 0.1) {
      animatedRef.current = false;
      // Optionally reset items state
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll(".grid-item");
        items.forEach(item => {
          (item as HTMLElement).style.opacity = "0";
        });
      }
    }
  }, [opacity]);

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-8 w-full max-w-4xl md:max-w-6xl mx-auto px-4 md:px-6 pointer-events-auto"
    >
      {PAINTINGS.slice(0, 6).map((p, i) => (
        <div 
          key={p.src}
          className={`grid-item opacity-0 group flex flex-col items-center ${
            i % 2 === 0 ? "mt-0" : "mt-2 md:mt-12"
          }`}
        >
          <div className="relative w-full max-w-[120px] md:max-w-none aspect-[4/5] overflow-hidden rounded-sm shadow-xl transition-all duration-700 hover:shadow-[0_20px_50px_rgba(72,52,52,0.3)] bg-odilon-heading/5">
            {/* Inner "Canvas" border */}
            <div className="absolute inset-0 border-[8px] border-odilon-button/30 z-10 pointer-events-none" />
            
            <img 
              src={getPaintingPath(p.src)} 
              alt={`${p.title} - ${p.artist}`}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            
            {/* Grain Overlay */}
            <div className="absolute inset-0 bg-black/5 mix-blend-soft-light pointer-events-none opacity-40" />
            
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-odilon-heading/20 to-transparent opacity-60 pointer-events-none" />
          </div>
        </div>
      ))}
    </div>
  );
};
