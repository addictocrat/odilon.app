"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { WORDMARK_LETTERS } from "@/lib/constants/wordmark";

gsap.registerPlugin(useGSAP);

/**
 * Letter path data for the Odilon wordmark.
 * `path` is the outline used for the stroke-drawing animation;
 * `fillPath` is the filled glyph that fades in after the outline is drawn.
 */

interface AnimatedLogoProps {
  reverseTrigger?: boolean;
  color?: string;
  className?: string;
}

export function AnimatedLogo({
  reverseTrigger = false,
  color = "#483434",
  className = "",
}: AnimatedLogoProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const hasPlayedRef = useRef(false);
  const activeTl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const svgEl = containerRef.current;
      if (!svgEl) return;

      // Kill any previous timeline to prevent staggered tweens from completing in the background
      if (activeTl.current) {
        activeTl.current.kill();
      }

      const strokePaths = Array.from(
        svgEl.querySelectorAll<SVGPathElement>("path.stroke-path"),
      );
      const fillPaths = Array.from(
        svgEl.querySelectorAll<SVGPathElement>("path.fill-path"),
      );
      const strokeLengths = strokePaths.map((p) => p.getTotalLength());

      if (reverseTrigger) {
        // REVERSE — Fast but visible de-draw.
        activeTl.current = gsap.timeline();

        activeTl.current.to(fillPaths, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        })
        .to(
          strokePaths,
          {
            strokeDashoffset: (i) => strokeLengths[i],
            duration: 0.6,
            ease: "power2.inOut",
          },
          0,
        )
        .to(
          strokePaths,
          {
            opacity: 0,
            duration: 0.2,
          },
          "-=0.2",
        );
      } else {
        // FORWARD — draw outlines, then fade fills in with a 1s overlap.
        
        // Explicitly reset to hidden/undrawn state before starting the forward timeline.
        gsap.set(strokePaths, {
          strokeDasharray: (i) => strokeLengths[i],
          strokeDashoffset: (i) => strokeLengths[i],
          opacity: 0,
        });
        gsap.set(fillPaths, { opacity: 0 });

        activeTl.current = gsap.timeline({
          delay: hasPlayedRef.current ? 0 : 0.5,
        });
        hasPlayedRef.current = true;

        activeTl.current.to(strokePaths, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 1.8,
          ease: "expo.inOut",
          stagger: 0.12,
        }).to(
          fillPaths,
          {
            opacity: 1,
            duration: 1.2,
            ease: "expo.inOut",
            stagger: 0.08,
          },
          "-=1",
        );
      }
    },
    { dependencies: [reverseTrigger], scope: containerRef, revertOnUpdate: false },
  );

  return (
    <div
      className={`w-full max-w-4xl mx-auto flex justify-center py-8 ${className}`}
    >
      <svg
        ref={containerRef}
        viewBox="0 0 302 90"
        className="w-full h-auto max-h-[22vw] overflow-visible select-none mix-blend-multiply drop-shadow-md"
      >
        {WORDMARK_LETTERS.map((letter) => (
          <g
            key={letter.key}
            transform={`translate(${letter.translate[0]}, ${letter.translate[1]})`}
          >
            <path
              className="stroke-path"
              d={letter.path}
              fill="none"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0 }}
            />
            <path
              className="fill-path"
              d={letter.fillPath}
              fill={color}
              stroke="none"
              style={{ opacity: 0 }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
