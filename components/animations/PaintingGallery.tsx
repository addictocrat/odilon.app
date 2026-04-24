"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Sparkle } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { PAINTINGS, getPaintingPath } from "@/lib/paintings";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Pre-calculated grid spots that avoid the center logo area.
const gridSpots = [
  { x: 12, y: 18, mobileHidden: true },
  { x: 32, y: 18 },
  { x: 68, y: 18 },
  { x: 88, y: 18, mobileHidden: true }, // Top
  { x: 10, y: 50, mobileHidden: true },
  { x: 90, y: 50, mobileHidden: true }, // Mid
  { x: 12, y: 82, mobileHidden: true },
  { x: 32, y: 82 },
  { x: 68, y: 82 },
  { x: 88, y: 82, mobileHidden: true }, // Bot
];

const paintingConfigs = PAINTINGS.map((p, i) => {
  const spot = gridSpots[i % gridSpots.length];

  // Deterministic jitter keeps the grid organic-looking but stable across renders.
  const top = spot.y + Math.sin(i * 1.5) * 4;
  const left = spot.x + Math.cos(i * 2.2) * 5;

  return {
    src: p.src,
    top: `${top}%`,
    left: `${left}%`,
    depth: 0.15 + (i % 4) * 0.15, // deeper values = larger parallax amplitude
    scale: 0.28 + (i % 3) * 0.08,
    rotation: (i % 6) * 12 - 30,
    alt: `${p.title} - ${p.artist}`,
    mobileHidden: (spot as { mobileHidden?: boolean }).mobileHidden ?? false,
  };
});

// Time the sparkle spends stationary on each painting before it moves on.
const SPARKLE_DWELL_MS = 4000;
// Fade-out window before the sparkle starts travelling to the next spot.
const SPARKLE_FADE_MS = 400;
// Travel animation length (matches the fade-in that follows).
const SPARKLE_TRAVEL_MS = 1000;

export const PaintingGallery = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for the parallax layers: outer for scroll, inner for mouse tilt.
  const paintingMouseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const paintingScrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  // The sparkle has three nested wrappers — one per transform source
  // (position, scroll parallax, mouse parallax) so they don't fight.
  const sparklePositionRef = useRef<HTMLDivElement | null>(null);
  const sparkleScrollRef = useRef<HTMLDivElement | null>(null);
  const sparkleMouseRef = useRef<HTMLDivElement | null>(null);

  // Proxy object that GSAP tweens — a render loop syncs it onto the DOM.
  const sparkleProxy = useRef({
    x: parseFloat(paintingConfigs[0].left),
    y: parseFloat(paintingConfigs[0].top),
    depth: paintingConfigs[0].depth,
  });

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const activeIndexRef = useRef<number>(0);

  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection and preloading
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    let loadedCount = 0;
    PAINTINGS.forEach((p) => {
      const img = new Image();
      img.src = getPaintingPath(p.src);
      const done = () => {
        loadedCount++;
        if (loadedCount === PAINTINGS.length) setIsLoaded(true);
      };
      img.onload = done;
      img.onerror = done;
    });

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mouse-driven parallax
  useGSAP(
    () => {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const centerX = innerWidth / 2;
        const centerY = innerHeight / 2;
        const mouseX = (clientX - centerX) / centerX; // -1..1
        const mouseY = (clientY - centerY) / centerY; // -1..1

        paintingMouseRefs.current.forEach((el, i) => {
          if (!el) return;
          const { depth } = paintingConfigs[i];
          gsap.to(el, {
            x: mouseX * 100 * depth,
            y: mouseY * 100 * depth,
            rotationX: mouseY * -10 * depth,
            rotationY: mouseX * 10 * depth,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        if (sparkleMouseRef.current) {
          const depth = sparkleProxy.current.depth;
          gsap.to(sparkleMouseRef.current, {
            x: mouseX * 100 * depth,
            y: mouseY * 100 * depth,
            rotationX: mouseY * -10 * depth,
            rotationY: mouseX * 10 * depth,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    },
    { scope: containerRef },
  );

  // Scroll-driven parallax
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const scrollY = self.scroll();

          paintingScrollRefs.current.forEach((el, i) => {
            if (!el) return;
            const { depth } = paintingConfigs[i];
            const speed = 0.5 + depth * 2;
            el.style.transform = `translateY(${-scrollY * speed}px)`;
          });

          if (sparkleScrollRef.current) {
            const depth = sparkleProxy.current.depth;
            const speed = 0.5 + depth * 2;
            sparkleScrollRef.current.style.transform = `translateY(${-scrollY * speed}px)`;
          }
        },
      });
    },
    { scope: containerRef },
  );

  // Sparkle travel cycle
  useGSAP(
    () => {
      let active = true;
      let travelTween: gsap.core.Tween | null = null;
      let pauseTimer: ReturnType<typeof setTimeout> | null = null;

      const goToNext = () => {
        if (!active) return;

        const currentIdx = activeIndexRef.current;
        let nextIdx = (currentIdx + 1) % paintingConfigs.length;

        if (isMobile) {
          let attempts = 0;
          while (
            paintingConfigs[nextIdx].mobileHidden &&
            attempts < paintingConfigs.length
          ) {
            nextIdx = (nextIdx + 1) % paintingConfigs.length;
            attempts++;
          }
        }

        const nextConfig = paintingConfigs[nextIdx];
        setIsVisible(false);

        pauseTimer = setTimeout(() => {
          if (!active) return;

          travelTween = gsap.to(sparkleProxy.current, {
            x: parseFloat(nextConfig.left),
            y: parseFloat(nextConfig.top),
            depth: nextConfig.depth,
            duration: SPARKLE_TRAVEL_MS / 1000,
            ease: "expo.inOut",
          });

          pauseTimer = setTimeout(() => {
            if (!active) return;
            activeIndexRef.current = nextIdx;
            setActiveIndex(nextIdx);
            setIsVisible(true);
            pauseTimer = setTimeout(goToNext, SPARKLE_DWELL_MS);
          }, SPARKLE_TRAVEL_MS);
        }, SPARKLE_FADE_MS);
      };

      // Initialization logic
      let initialIdx = 0;
      if (isMobile && paintingConfigs[0].mobileHidden) {
        initialIdx = paintingConfigs.findIndex((p) => !p.mobileHidden);
        if (initialIdx === -1) initialIdx = 0;
      }

      setActiveIndex(initialIdx);
      setIsVisible(true);
      activeIndexRef.current = initialIdx;

      sparkleProxy.current = {
        x: parseFloat(paintingConfigs[initialIdx].left),
        y: parseFloat(paintingConfigs[initialIdx].top),
        depth: paintingConfigs[initialIdx].depth,
      };

      pauseTimer = setTimeout(goToNext, 2500);

      const renderLoop = () => {
        if (!active) return;
        if (sparklePositionRef.current) {
          sparklePositionRef.current.style.left = `${sparkleProxy.current.x}%`;
          sparklePositionRef.current.style.top = `${sparkleProxy.current.y}%`;
        }
        rafId = requestAnimationFrame(renderLoop);
      };
      let rafId = requestAnimationFrame(renderLoop);

      return () => {
        active = false;
        travelTween?.kill();
        if (pauseTimer) clearTimeout(pauseTimer);
        cancelAnimationFrame(rafId);
      };
    },
    { dependencies: [isMobile], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 f z-0 pointer-events-none overflow-hidden"
    >
      {/* Invisible trajectory */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={(() => {
            const visibleConfigs = isMobile
              ? paintingConfigs.filter((c) => !c.mobileHidden)
              : paintingConfigs;
            if (visibleConfigs.length === 0) return "";
            return (
              visibleConfigs
                .map((c) => `${parseFloat(c.left)},${parseFloat(c.top)}`)
                .join(" ") +
              ` ${parseFloat(visibleConfigs[0].left)},${parseFloat(visibleConfigs[0].top)}`
            );
          })()}
          fill="none"
          stroke="transparent"
          strokeWidth="0.1"
        />
      </svg>

      {/* The Sparkle */}
      <div
        ref={sparklePositionRef}
        className={`absolute z-50 pointer-events-none transition-opacity duration-500 ${
          isMobile ? "opacity-0 invisible" : "opacity-100 visible"
        }`}
        style={{
          left: `${sparkleProxy.current.x}%`,
          top: `${sparkleProxy.current.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div ref={sparkleScrollRef}>
          <div ref={sparkleMouseRef} className="relative">
            <div className="w-8 h-8 bg-odilon-logo rounded-full flex items-center justify-center shadow-2xl border border-[#B6C7AA]/30 backdrop-blur-sm relative z-50">
              <Sparkle className="w-6 h-6 animate-pulse text-[#B6C7AA] fill-[#B6C7AA]/30" />
            </div>

            {/* Message box */}
            {(() => {
              const isRightEdge =
                parseFloat(paintingConfigs[activeIndex].left) > 65;
              const posClass = isRightEdge ? "right-12" : "left-12";
              const slideClass = isVisible
                ? "opacity-100 translate-x-0"
                : isRightEdge
                  ? "opacity-0 translate-x-4"
                  : "opacity-0 -translate-x-4";
              return (
                <div
                  className={`absolute ${posClass} rounded-lg top-1/2 -translate-y-1/2 z-[100] w-72 p-2 px-3 bg-odilon-logo shadow-2xl transition-all duration-500 pointer-events-none text-[#d3ddcc] font-sans ${slideClass}`}
                >
                  {PAINTINGS[activeIndex] && (
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-sm leading-relaxed">
                          {PAINTINGS[activeIndex].message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {paintingConfigs.map((config, i) => (
        <div
          key={config.src}
          role="img"
          aria-label={config.alt}
          className={`absolute transition-opacity duration-500 ${
            isMobile && config.mobileHidden
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          }`}
          style={{
            top: config.top,
            left: config.left,
            transform: "translate(-50%, -50%)",
            visibility: isMobile && config.mobileHidden ? "hidden" : "visible",
          }}
        >
          {/* Scroll parallax wrapper */}
          <div
            ref={(el) => {
              paintingScrollRefs.current[i] = el;
            }}
          >
            {/* Idle float */}
            <div
              style={{
                animation: `float-anim-${i} ${3.5 + config.depth * 3}s ease-in-out infinite alternate`,
              }}
            >
              <style>{`
                @keyframes float-anim-${i} {
                  0% { transform: translateY(-${8 + config.depth * 10}px) rotateZ(-${1 + config.depth * 2}deg); }
                  100% { transform: translateY(${8 + config.depth * 10}px) rotateZ(${1 + config.depth * 2}deg); }
                }
              `}</style>
              {/* Mouse parallax wrapper */}
              <div
                ref={(el) => {
                  paintingMouseRefs.current[i] = el;
                }}
                className={`transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                style={{
                  width: "280px",
                  aspectRatio: "2/3",
                  perspective: "1000px",
                }}
              >
                <div
                  className="w-full h-full shadow-2xl overflow-hidden"
                  style={{
                    transform: `scale(calc(${config.scale} * var(--app-scale))) rotate(${config.rotation}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{
                      backgroundImage: `url(${getPaintingPath(config.src)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/5 mix-blend-multiply opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
