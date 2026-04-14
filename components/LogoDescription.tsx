"use client";

import React, { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { PaintingSearch } from "./PaintingSearch";

export function LogoDescription() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = "Talk to paintings.";

  useEffect(() => {
    if (!containerRef.current) return;

    // Select all letter spans
    const letters = containerRef.current.querySelectorAll(".letter");
    
    // Animate letters
    animate(letters, {
      opacity: [0, 0.8],
      translateY: [15, 0],
      translateZ: 0,
      duration: 800,
      easing: "easeOutExpo",
      delay: stagger(50, { start: 2200 }), // Slightly delayed relative to logo start (1000ms)
    });

    const searchBar = containerRef.current.querySelector(".search-bar");
    if (searchBar) {
      animate(searchBar, {
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 800,
        easing: "easeOutExpo",
        delay: 2200 + (text.length * 50) + 200, // Animate after text is roughly done
      });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center"
    >
      <div className="flex" aria-label={text}>
        {text.split("").map((char, index) => (
          <span
            key={index}
            className="letter inline-block font-body text-foreground text-base sm:text-lg lg:text-4xl tracking-[0.2em] font-light opacity-0"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
      
      <PaintingSearch 
        containerClassName="search-bar mt-8 w-full max-w-2xl opacity-0"
      />
      
    </div>
  );
}
