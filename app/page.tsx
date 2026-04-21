"use client";

import { useEffect, useState } from "react";
import { PaintingGallery } from "@/components/animations/PaintingGallery";
import { ScrollGuides } from "@/components/animations/ScrollGuides";
import { HeroSection } from "@/components/homepagesections/HeroSection";
import { AppDescription } from "@/components/homepagesections/AppDescription";
import { CTASection } from "@/components/homepagesections/CTASection";
import { useScrollStore } from "@/hooks/useScrollStore";

export default function Home() {
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [descOpacity, setDescOpacity] = useState(0);
  const [ctaOpacity, setCtaOpacity] = useState(0);
  const [logoReverse, setLogoReverse] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Keep track of the current animation frame to allow cancellation
  const [scrollFrame, setScrollFrame] = useState<number | null>(null);

  const smoothScrollTo = (target: number, onComplete?: () => void) => {
    if (typeof window === "undefined") return;

    // Cancel any existing scroll animation
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
    }

    setIsScrolling(true);
    const start = window.scrollY;
    const distance = target - start;
    const duration = 1600;
    let startTime: number | null = null;

    // Ease In Out Quint
    const easeInOutQuint = (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;

    const step = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const ease = easeInOutQuint(progress);
      window.scrollTo(0, start + distance * ease);

      if (timeElapsed < duration) {
        const frame = requestAnimationFrame(step);
        setScrollFrame(frame);
      } else {
        setIsScrolling(false);
        setScrollFrame(null);
        onComplete?.();
      }
    };

    const firstFrame = requestAnimationFrame(step);
    setScrollFrame(firstFrame);
  };

  const handleScrollToDesc = () => {
    const vh = window.innerHeight;
    smoothScrollTo(vh * 2);
  };

  useEffect(() => {
    let lastWheelTime = 0;
    const threshold = 800; // ms between distinct scrolls

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastWheelTime < threshold || isScrolling) return;

      const currentScroll = window.scrollY;
      const vh = window.innerHeight;
      const stages = [0, vh * 2, vh * 4];

      if (e.deltaY > 0) {
        // Find next stage
        const nextStage = stages.find((s) => s > currentScroll + 50);
        if (nextStage !== undefined) {
          smoothScrollTo(nextStage);
          lastWheelTime = now;
        }
      } else if (e.deltaY < 0) {
        // Find prev stage
        const prevStage = [...stages]
          .reverse()
          .find((s) => s < currentScroll - 50);
        if (prevStage !== undefined) {
          smoothScrollTo(prevStage);
          lastWheelTime = now;
        }
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

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
      const vh = window.innerHeight;
      const stages = [0, vh * 2, vh * 4];

      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          // Swipe up -> Scroll down
          const nextStage = stages.find((s) => s > currentScroll + 50);
          if (nextStage !== undefined) {
            smoothScrollTo(nextStage);
            lastWheelTime = now;
          }
        } else {
          // Swipe down -> Scroll up
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

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isScrolling]);

  useEffect(() => {
    const unsubscribe = useScrollStore.subscribe((state) => {
      const y = state.smoothedY;
      const vh = window.innerHeight;

      // Sync Logo Reverse state with scroll position
      // Trigger reverse immediately as we scroll away from the top
      if (state.scrollY < 10) {
        setLogoReverse(false);
      } else {
        setLogoReverse(true);
      }

      // Logo Fade Out between 0.6vh and 1.2vh
      const logoStart = vh * 0.6;
      const logoEnd = vh * 1.2;
      const lOpacity = Math.max(
        0,
        Math.min(1, 1 - (y - logoStart) / (logoEnd - logoStart)),
      );
      setLogoOpacity(lOpacity);

      // Description Fade In between 1.2vh and 1.8vh
      const descStart = vh * 1.2;
      const descEnd = vh * 1.8;
      // Also fade OUT at 2.4vh
      const descOutStart = vh * 2.4;
      const descOutEnd = vh * 2.8;

      let dOpacity = Math.max(
        0,
        Math.min(1, (y - descStart) / (descEnd - descStart)),
      );
      if (y > descOutStart) {
        dOpacity = Math.max(
          0,
          Math.min(
            dOpacity,
            1 - (y - descOutStart) / (descOutEnd - descOutStart),
          ),
        );
      }
      setDescOpacity(dOpacity);

      // CTA Fade In between 3.2vh and 3.8vh
      const ctaStart = vh * 3.2;
      const ctaEnd = vh * 3.7;
      const cOpacity = Math.max(
        0,
        Math.min(1, (y - ctaStart) / (ctaEnd - ctaStart)),
      );
      setCtaOpacity(cOpacity);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Lock scroll for the home page's automated experience
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <main className="relative bg-background min-h-[500vh] touch-none">
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

        {/* Floating Paintings Container */}
        <PaintingGallery />

        {/* Orchestrated Content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
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
