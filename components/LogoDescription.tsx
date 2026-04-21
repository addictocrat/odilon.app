"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { PaintingSearch } from "./PaintingSearch";

gsap.registerPlugin(useGSAP, SplitText);

const HEADLINE = "Talk to paintings.";

// Intro pacing — the Odilon logo starts drawing at ~0.4s, so the headline
// letters begin shortly after that. The search bar follows once the letters
// have finished (letters × stagger + a small gap).
const LETTER_START_DELAY = 2.6;
const LETTER_STAGGER = 0.05;

/**
 * Hero subtitle: "Talk to paintings." + a painting-search bar.
 * Letters fade/rise in on a stagger, then the search bar slides up.
 */
export function LogoDescription() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Headline letters: split text into characters and animate them rising
      const split = new SplitText(".headline", {
        type: "chars",
        charsClass:
          "letter inline-block font-body text-foreground text-base sm:text-lg lg:text-4xl tracking-[0.2em] font-light opacity-0",
      });
      
      // Reveal the container now that SplitText has replaced the raw text
      gsap.set(".headline", { opacity: 1 });

      const tl = gsap.timeline();

      tl.fromTo(
        split.chars,
        { opacity: 0, y: 15 },
        {
          opacity: 0.8,
          y: 0,
          duration: 0.8,
          ease: "expo.out",
          stagger: LETTER_STAGGER,
          delay: LETTER_START_DELAY,
        },
      ).fromTo(
        ".search-bar",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "expo.out",
        },
        "-=0.6", // Begin sliding up as the letters are settling
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center"
    >
      <div className="headline opacity-0" aria-label={HEADLINE}>
        {HEADLINE}
      </div>

      <PaintingSearch containerClassName="search-bar mt-8 w-full max-w-2xl opacity-0" />
    </div>
  );
}
