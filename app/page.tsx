"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

import { PaintingGallery } from "@/components/animations/PaintingGallery";
import { ScrollGuides } from "@/components/animations/ScrollGuides";
import { HeroSection } from "@/components/homepagesections/HeroSection";
import { AppDescription } from "@/components/homepagesections/AppDescription";
import { CTASection } from "@/components/homepagesections/CTASection";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Home() {
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [descOpacity, setDescOpacity] = useState(0);
  const [ctaOpacity, setCtaOpacity] = useState(0);
  const [logoReverse, setLogoReverse] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const smoothScrollTo = (target: number, onComplete?: () => void) => {
    if (typeof window === "undefined") return;

    setIsScrolling(true);
    gsap.to(window, {
      scrollTo: target,
      duration: 1.6,
      ease: "power4.inOut", // quint.inOut equivalent or custom
      onComplete: () => {
        setIsScrolling(false);
        onComplete?.();
      },
      overwrite: true,
    });
  };

  const handleScrollToDesc = () => {
    const vh = window.innerHeight;
    smoothScrollTo(vh * 2);
  };

  useGSAP(
    () => {
      const vh = window.innerHeight;
      const stages = [0, vh * 2, vh * 4];
      const threshold = 800; // ms between distinct scrolls
      let lastWheelTime = 0;

      // --- 1. Opacity Orchestration via ScrollTrigger ---
      const stateProxy = {
        logoOpacity: 1,
        descOpacity: 0,
        ctaOpacity: 0,
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom", 
          scrub: true,
          onUpdate: (self) => {
            setLogoOpacity(stateProxy.logoOpacity);
            setDescOpacity(stateProxy.descOpacity);
            setCtaOpacity(stateProxy.ctaOpacity);
            setLogoReverse(window.scrollY >= 10);
          },
        },
      });

      // Map segments to the 4vh timeline
      // Logo Fade Out between 0.6vh and 1.2vh
      tl.to(stateProxy, { logoOpacity: 0, ease: "none", duration: 0.6 }, 0.6);

      // Description Fade In between 1.2vh and 1.8vh
      tl.to(stateProxy, { descOpacity: 1, ease: "none", duration: 0.6 }, 1.2);
      // Description Fade Out between 2.4vh and 2.8vh
      tl.to(stateProxy, { descOpacity: 0, ease: "none", duration: 0.4 }, 2.4);

      // CTA Fade In between 3.2vh and 3.7vh
      tl.to(stateProxy, { ctaOpacity: 1, ease: "none", duration: 0.5 }, 3.2);

      // --- 2. Scroll Hijacking Logic ---
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTime < threshold || isScrolling) return;

        const currentScroll = window.scrollY;
        if (e.deltaY > 0) {
          const nextStage = stages.find((s) => s > currentScroll + 50);
          if (nextStage !== undefined) {
            smoothScrollTo(nextStage);
            lastWheelTime = now;
          }
        } else if (e.deltaY < 0) {
          const prevStage = [...stages]
            .reverse()
            .find((s) => s < currentScroll - 50);
          if (prevStage !== undefined) {
            smoothScrollTo(prevStage);
            lastWheelTime = now;
          }
        }
      };

      let touchStartY = 0;
      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };

      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
      };

      const onTouchEnd = (e: TouchEvent) => {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        const now = Date.now();
        if (now - lastWheelTime < threshold || isScrolling) return;

        const currentScroll = window.scrollY;
        if (Math.abs(deltaY) > 50) {
          if (deltaY > 0) {
            const nextStage = stages.find((s) => s > currentScroll + 50);
            if (nextStage !== undefined) {
              smoothScrollTo(nextStage);
              lastWheelTime = now;
            }
          } else {
            const prevStage = [...stages]
              .reverse()
              .find((s) => s < currentScroll - 50);
            if (prevStage !== undefined) {
              smoothScrollTo(prevStage);
              lastWheelTime = now;
            }
          }
        }
      };

      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd, { passive: true });

      // Lock scroll for the home page's automated experience
      document.body.style.overflowY = "hidden";

      return () => {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        document.body.style.overflowY = "auto";
      };
    },
    { scope: containerRef, dependencies: [isScrolling] },
  );

  return (
    <main 
      ref={containerRef}
      className="relative bg-background min-h-[500vh] touch-none"
    >
      {/* Visual Guides */}
      <ScrollGuides />

      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center touch-auto">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill="#8b7f6c" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* CTA Background Layer - outside the scaling container to ensure it fills the screen */}
        <div 
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{ backgroundColor: "#483434", opacity: ctaOpacity }}
        />

        {/* Floating Paintings Container */}
        <PaintingGallery />

        {/* Orchestrated Content */}
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-500 will-change-transform"
          style={{ transform: "scale(var(--app-scale))", transformOrigin: "center" }}
        >
          <HeroSection
            opacity={logoOpacity}
            reverseTrigger={logoReverse}
            onScrollClick={handleScrollToDesc}
          />

          {/* Description Section */}
          <AppDescription opacity={descOpacity} />

          {/* CTA Section */}
          <CTASection opacity={ctaOpacity} />
        </div>

        {/* Framing element */}
        <div className="absolute inset-10 border-[1px] border-odilon-logo/5 pointer-events-none z-20" />
      </div>
    </main>
  );
}
