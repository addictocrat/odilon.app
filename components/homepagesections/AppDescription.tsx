"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, splitText, stagger } from "animejs";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { SocialProof } from "@/components/SocialProof";
import { PAINTINGS, getPaintingPath } from "@/lib/paintings";

export const AppDescription = ({ opacity }: { opacity: number }) => {
  const router = useRouter();
  const [hasAnimated, setHasAnimated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const closedEyes = PAINTINGS.find(p => p.id === "closed-eyes");

  useEffect(() => {
    // splitText should only be run once to wrap words in spans
    if (textRef.current && !isInitialized.current) {
      const pElements = textRef.current.querySelectorAll("p");
      pElements.forEach((p) => {
        // In anime.js v4, the template must be passed via the 'words' property
        splitText(p, {
          words: '<span class="word inline-block opacity-0 translate-y-6">{value}</span>'
        });
      });

      // Inject the required styles into specific words directly
      // This ensures the background animates exactly in sync with the word itself
      const generatedWords = textRef.current.querySelectorAll(".word");
      generatedWords.forEach((w) => {
        if (w.textContent?.includes("explores")) {
          w.classList.add("text-[#919F88]");
        } else if (w.textContent?.includes("appreciates")) {
          w.classList.add("text-[#919F88]");
        } else if (w.textContent?.includes("art")) {
          w.classList.add("bg-yellow-500", "px-2", "py-0", "rounded-lg", "font-bold");
        } else if (w.textContent?.includes("voice")) {
          w.classList.add("font-bold");
        }
      });

      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    // Trigger animation when the section becomes significantly visible
    if (opacity > 0.15 && !hasAnimated) {
      setHasAnimated(true);
      
      const words = textRef.current?.querySelectorAll(".word");
      if (words && words.length > 0) {
        animate(words, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 800,
          delay: stagger(30),
          easing: "easeOutQuart"
        });
      }

      // Animate the chat bubbles with a bouncy reveal
      const bubbles = containerRef.current?.querySelectorAll(".chat-bubble");
      if (bubbles && bubbles.length > 0) {
        animate(bubbles, {
          opacity: [0, 1],
          scale: [0.8, 1],
          translateY: [20, 0],
          duration: 1400,
          delay: stagger(400, { start: 600 }),
          easing: "easeOutElastic(1, .8)"
        });
      }

      // Animate the button
      const getStartedBtn = containerRef.current?.querySelector(".get-started-btn");
      if (getStartedBtn) {
        animate(getStartedBtn, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
          delay: 0,
          easing: "easeOutQuart"
        });
      }

      // Animate the review badge
      const reviewBadge = containerRef.current?.querySelector(".review-badge");
      if (reviewBadge) {
        animate(reviewBadge, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
          delay: 200,
          easing: "easeOutQuart"
        });
      }
    } 
    // Reset state when user scrolls completely away
    else if (opacity === 0 && hasAnimated) {
      setHasAnimated(false);
      
      const words = textRef.current?.querySelectorAll(".word");
      if (words) {
        animate(words, { opacity: 0, translateY: 24, duration: 0 });
      }

      const bubbles = containerRef.current?.querySelectorAll(".chat-bubble");
      if (bubbles) {
        animate(bubbles, { opacity: 0, scale: 0.8, translateY: 20, duration: 0 });
      }

      const getStartedBtn = containerRef.current?.querySelector(".get-started-btn");
      if (getStartedBtn) {
        animate(getStartedBtn, { opacity: 0, translateY: 20, duration: 0 });
      }

      const reviewBadge = containerRef.current?.querySelector(".review-badge");
      if (reviewBadge) {
        animate(reviewBadge, { opacity: 0, translateY: 20, duration: 0 });
      }
    }
  }, [opacity, hasAnimated]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 md:px-24 lg:px-32"
      style={{ opacity }}
    >
      <div className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-0 items-center">
        {/* Left Side: Painting (Huge, 2:3) */}
        <div className="relative w-[75%] md:w-[70%] max-h-[75vh] mx-auto">
          {/* Chat Message 1 */}
          <div className="chat-bubble absolute -top-6 -left-4 md:-top-10 md:-left-10 bg-odilon-logo text-[#d3ddcc] p-4 md:p-6 rounded-2xl shadow-2xl max-w-[200px] md:max-w-[280px] font-header text-sm md:text-xl z-20 transform -rotate-2 opacity-0">
            "Odilon Redon creates a bridge between our reality and hidden dreams."
            {/* Bubble Tail */}
            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-odilon-logo rotate-45" />
          </div>

          <div className="relative aspect-[2/3] w-full shadow-2xl overflow-hidden rounded-sm ring-1 ring-odilon-logo/10">
            <Image
              src={getPaintingPath(closedEyes?.src || "")}
              alt={closedEyes ? `${closedEyes.title} - ${closedEyes.artist}` : "Painting"}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Chat Message 2 */}
          <div className="chat-bubble absolute -bottom-6 -right-4 md:-bottom-10 md:-right-10 bg-odilon-logo text-[#d3ddcc] p-4 md:p-6 rounded-2xl shadow-2xl max-w-[200px] md:max-w-[280px] font-header text-sm md:text-xl z-20 transform rotate-2 opacity-0">
            "The closed eyes invite us to look within our own spirits."
            {/* Bubble Tail */}
            <div className="absolute -top-2 right-8 w-4 h-4 bg-odilon-logo rotate-45" />
          </div>
        </div>

        {/* Right Side: Programmatic Text */}
        <div className="flex flex-col justify-center items-start text-left max-w-xl">
          <div ref={textRef} className="space-y-4 md:space-y-6">
            <div className=" font-logo text-xl md:text-2xl lg:text-3xl text-odilon-heading leading-[1.15] tracking-tight border-b-4 border-[#919F88] font-bold w-fit ">odilon</div>
            <p className="font-header text-4xl md:text-5xl lg:text-6xl text-odilon-heading leading-[1.15] tracking-tight">
              AI that explores <  br /> and appreciates art.
            </p>
            <p className="font-body text-4xl md:text-5xl lg:text-6xl text-odilon-heading leading-[1.15] tracking-tight">
              & becomes its voice.
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mt-10">
             
              <button 
                onClick={() => router.push("/signup")}
                className="get-started-btn px-12 py-5 bg-[#EBEBEB] text-odilon-heading font-header text-2xl rounded-sm shadow-[inset_0_2px_5px_rgba(0,0,0,0.2),0_10px_15px_rgba(0,0,0,0.1)] hover:bg-[#F3F4F6] hover:scale-105 active:scale-95 transition-all duration-500 pointer-events-auto opacity-0 translate-y-5 "
              >
                Join now
              </button>
              <SocialProof className="opacity-0 translate-y-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

