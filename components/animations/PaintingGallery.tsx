"use client";

import React, { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { useScrollStore } from "@/hooks/useScrollStore";
import { Sparkle } from "lucide-react";

import { PAINTINGS, getPaintingPath } from "@/lib/paintings";

// Pre-calculate even distribution that avoids the center logo
const gridSpots = [
  { x: 12, y: 18 }, { x: 32, y: 18 }, { x: 68, y: 18 }, { x: 88, y: 18 }, // Top
  { x: 10, y: 50 }, { x: 90, y: 50 },                                   // Mid
  { x: 12, y: 82 }, { x: 32, y: 82 }, { x: 68, y: 82 }, { x: 88, y: 82 }, // Bot
];

const paintingConfigs = PAINTINGS.map((p, i) => {
  const spot = gridSpots[i % gridSpots.length];
  
  // Add deterministic jitter to keep it organic but stable
  const top = spot.y + (Math.sin(i * 1.5) * 4);
  const left = spot.x + (Math.cos(i * 2.2) * 5);

  return {
    src: p.src,
    top: `${top}%`,
    left: `${left}%`,
    depth: 0.15 + (i % 4) * 0.15, // slightly more pronounced parallax
    scale: 0.28 + (i % 3) * 0.08,  // slightly smaller to ensure no overlap
    rotation: (i % 6) * 12 - 30,  // varied elegant tilts
    alt: `${p.title} - ${p.artist}`,
  };
});

export const PaintingGallery = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const paintingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const sparkleRef = useRef<HTMLDivElement | null>(null);
  const sparkleScrollRef = useRef<HTMLDivElement | null>(null);
  const sparkleMouseRef = useRef<HTMLDivElement | null>(null);
  const sparkleProxy = useRef({
    x: parseFloat(paintingConfigs[0].left),
    y: parseFloat(paintingConfigs[0].top),
    depth: paintingConfigs[0].depth
  });

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const activeIndexRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    let travelAnim: ReturnType<typeof animate> | null = null;
    let pauseTimer: ReturnType<typeof setTimeout> | null = null;

    const goToNext = () => {
      if (!active) return;

      const currentIdx = activeIndexRef.current;
      const nextIdx = (currentIdx + 1) % paintingConfigs.length;
      const nextConfig = paintingConfigs[nextIdx];

      // 1. Fade out the box — content stays, only visibility changes
      setIsVisible(false);

      // 2. Wait 500ms for CSS fade-out to finish, then start travel
      pauseTimer = setTimeout(() => {
        if (!active) return;

        // 3. Animate the sparkle proxy to the next position
        travelAnim = animate(sparkleProxy.current, {
          x: parseFloat(nextConfig.left),
          y: parseFloat(nextConfig.top),
          depth: nextConfig.depth,
          duration: 1000,
          easing: "easeInOutExpo",
        });

        // 4. After travel completes, swap content and fade in
        pauseTimer = setTimeout(() => {
          if (!active) return;
          activeIndexRef.current = nextIdx;
          setActiveIndex(nextIdx);
          setIsVisible(true);

          // 5. Box is visible — schedule next departure after 2.5s
          pauseTimer = setTimeout(goToNext, 4000);
        }, 1000); // exactly matches travel duration
      }, 400); // matches CSS transition-all duration-500
    };

    // Start the loop: show first painting, begin cycling after 5s
    setActiveIndex(0);
    setIsVisible(true);
    activeIndexRef.current = 0;
    pauseTimer = setTimeout(goToNext, 2500);

    // Render loop: sync sparkle DOM position from proxy
    const renderLoop = () => {
      if (!active) return;
      if (sparkleRef.current) {
        sparkleRef.current.style.left = `${sparkleProxy.current.x}%`;
        sparkleRef.current.style.top = `${sparkleProxy.current.y}%`;
      }
      requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // Preload all images
    let loadedCount = 0;
    const preloadImages = () => {
      PAINTINGS.forEach((p) => {
        const img = new Image();
        img.src = getPaintingPath(p.src);
        img.onload = () => {
          loadedCount++;
          if (loadedCount === PAINTINGS.length) {
            setIsLoaded(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === PAINTINGS.length) {
            setIsLoaded(true);
          }
        };
      });
    };

    preloadImages();

    // Mouse movement logic
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;

      const mouseX = (clientX - centerX) / centerX; // -1 to 1
      const mouseY = (clientY - centerY) / centerY; // -1 to 1

      paintingRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const config = paintingConfigs[i];
        
        const xMove = mouseX * 100 * config.depth;
        const yMove = mouseY * 100 * config.depth;
        const rotateX = mouseY * -10 * config.depth;
        const rotateY = mouseX * 10 * config.depth;

        animate(ref, {
          translateX: xMove,
          translateY: yMove,
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 800,
          easing: "easeOutQuad",
        });
      });

      if (sparkleMouseRef.current) {
        const depth = sparkleProxy.current.depth;
        animate(sparkleMouseRef.current, {
          translateX: mouseX * 100 * depth,
          translateY: mouseY * 100 * depth,
          rotateX: mouseY * -10 * depth,
          rotateY: mouseX * 10 * depth,
          duration: 800,
          easing: "easeOutQuad",
        });
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);

    // Subscribe to smooth scroll updates
    const unsubscribeScroll = useScrollStore.subscribe((state) => {
      const smoothedY = state.smoothedY;
      scrollRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const config = paintingConfigs[i];
        
        // Items with higher depth (closer) will ascend faster
        const scrollSpeedMultiplier = 0.5 + (config.depth * 2);
        const yOffset = -smoothedY * scrollSpeedMultiplier;
        
        ref.style.transform = `translateY(${yOffset}px)`;
      });

      if (sparkleScrollRef.current) {
        const depth = sparkleProxy.current.depth;
        const scrollSpeedMultiplier = 0.5 + (depth * 2);
        const yOffset = -smoothedY * scrollSpeedMultiplier;
        sparkleScrollRef.current.style.transform = `translateY(${yOffset}px)`;
      }
    });

    return () => {
      active = false;
      if (travelAnim) travelAnim.pause();
      if (pauseTimer) clearTimeout(pauseTimer);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      unsubscribeScroll();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Invisible connecting lines as trajectory */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={paintingConfigs.map(c => `${parseFloat(c.left)},${parseFloat(c.top)}`).join(' ') + ` ${parseFloat(paintingConfigs[0].left)},${parseFloat(paintingConfigs[0].top)}`}
          fill="none"
          stroke="transparent"
          strokeWidth="0.1"
        />
      </svg>

      {/* The Sparkle Element */}
      <div
        ref={sparkleRef}
        className="absolute z-50 pointer-events-none"
        style={{
          left: `${parseFloat(paintingConfigs[0].left)}%`,
          top: `${parseFloat(paintingConfigs[0].top)}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div ref={sparkleScrollRef}>
          <div ref={sparkleMouseRef} className="relative">
            <div className="w-8 h-8 bg-odilon-logo rounded-full flex items-center justify-center shadow-2xl border border-[#B6C7AA]/30 backdrop-blur-sm relative z-50">
              <Sparkle className="w-6 h-6 animate-pulse text-[#B6C7AA] fill-[#B6C7AA]/30" />
            </div>

            {/* Analysis & Message Box — flips left when near right edge */}
            {(() => {
              const isRightEdge = parseFloat(paintingConfigs[activeIndex].left) > 65;
              const posClass = isRightEdge
                ? "right-12"  // box appears to the LEFT of the sparkle
                : "left-12"; // box appears to the RIGHT of the sparkle
              const slideClass = isVisible
                ? "opacity-100 translate-x-0"
                : isRightEdge
                  ? "opacity-0 translate-x-4"   // fades out toward right
                  : "opacity-0 -translate-x-4"; // fades out toward left
              return (
                <div
                  className={`absolute ${posClass} rounded-lg top-1/2 -translate-y-1/2 z-[100] w-72 p-2 px-3 bg-odilon-logo shadow-2xl transition-all duration-500 pointer-events-none text-[#d3ddcc] font-sans ${slideClass}`}
                >
              {PAINTINGS[activeIndex] && (
                <div className="flex flex-col gap-2">
                
                  {/* <div className="h-px w-full bg-[#483434]/10" /> */}
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
          className="absolute"
          style={{
            top: config.top,
            left: config.left,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Scroll Control Wrapper */}
          <div ref={(el) => { scrollRefs.current[i] = el; }}>
            {/* Idle Float Wrapper using flaw-free native CSS animation isolated to each piece */}
            <div 
              style={{ 
                animation: `float-anim-${i} ${3.5 + config.depth * 3}s ease-in-out infinite alternate` 
              }}
            >
              <style>{`
                @keyframes float-anim-${i} {
                  0% { transform: translateY(-${8 + config.depth * 10}px) rotateZ(-${1 + config.depth * 2}deg); }
                  100% { transform: translateY(${8 + config.depth * 10}px) rotateZ(${1 + config.depth * 2}deg); }
                }
              `}</style>
              {/* Mouse Control Wrapper */}
              <div
                ref={(el) => { paintingRefs.current[i] = el; }}
              className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                width: "280px",
                aspectRatio: "2/3",
                perspective: "1000px",
              }}
            >
            <div 
              className="w-full h-full shadow-2xl overflow-hidden"
              style={{ 
                transform: `scale(${config.scale}) rotate(${config.rotation}deg)`,
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
                {/* Grain and Texture Overlay */}
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
