"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { PAINTINGS, getPaintingPath } from "@/lib/paintings";

// Trigger the reveal once the CTA is clearly in view, and fully reset it
// once the section has essentially scrolled away so the next arrival replays.
const REVEAL_THRESHOLD = 0.4;
const RESET_THRESHOLD = 0.1;

export const MasonryGrid = ({ opacity }: { opacity: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const hasAnimatedRef = useRef(false);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const items = Array.from(
        root.querySelectorAll<HTMLElement>(".grid-item"),
      );
      const visibleItems = items.filter(
        (el) => window.getComputedStyle(el).display !== "none",
      );

      const isMobile = window.innerWidth < 768;
      const cols = isMobile ? 2 : 5;
      const rows = Math.ceil(visibleItems.length / cols);

      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        visibleItems,
        { opacity: 0, scale: 0.9, y: 40, rotation: 0 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          // Small random tilt per tile for a more organic feel.
          rotation: () => Math.random() * 4 - 2,
          duration: 1,
          ease: "power3.out",
          // GSAP supports grid-aware staggering natively — the wave travels
          // column-first on desktop, row-first on mobile.
          stagger: {
            each: 0.06,
            grid: [rows, cols],
            from: "start",
            axis: isMobile ? "y" : "x",
          },
        },
      );

      tlRef.current = tl;
    },
    { scope: containerRef },
  );

  // Drive entrance / reset from the parent scroll-derived opacity value.
  useGSAP(
    () => {
      if (!tlRef.current) return;

      if (opacity > REVEAL_THRESHOLD && !hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        tlRef.current.play();
      } else if (opacity < RESET_THRESHOLD && hasAnimatedRef.current) {
        hasAnimatedRef.current = false;
        tlRef.current.pause(0);
      }
    },
    { dependencies: [opacity], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-8 w-full max-w-4xl md:max-w-6xl mx-auto px-4 md:px-6 pointer-events-auto"
    >
      {PAINTINGS.slice(0, 10).map((p, i) => (
        <div
          key={p.src}
          className={`grid-item opacity-0 group flex flex-col items-center ${
            i >= 6 ? "hidden md:flex" : "flex"
          } ${i % 2 === 0 ? "mt-0" : "mt-2 md:mt-12"}`}
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
