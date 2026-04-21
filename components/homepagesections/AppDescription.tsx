"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";

import { SocialProof } from "@/components/SocialProof";
import { PAINTINGS, getPaintingPath } from "@/lib/paintings";

gsap.registerPlugin(useGSAP, SplitText);

// Trigger the entrance as soon as the section is noticeably visible, and
// fully reset it once the user has scrolled completely away.
const REVEAL_THRESHOLD = 0.15;
const RESET_THRESHOLD = 0;

// Words that get decorative styling baked into the split.
const ACCENT_WORDS = new Set(["explores", "appreciates"]);
const HIGHLIGHT_WORDS = new Set(["art"]);
const BOLD_WORDS = new Set(["voice"]);

export const AppDescription = ({ opacity }: { opacity: number }) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const hasAnimatedRef = useRef(false);

  const closedEyes = PAINTINGS.find((p) => p.id === "closed-eyes");

  useGSAP(
    () => {
      if (!textRef.current) return;

      // Initialize SplitText for all paragraphs within the text container
      const split = new SplitText(textRef.current.querySelectorAll("p"), {
        type: "words",
        wordsClass: "word inline-block will-change-transform opacity-0",
      });

      // Apply decorative styling to specific words post-split
      split.words.forEach((word) => {
        const bare =
          word.textContent?.toLowerCase().replace(/[^a-z]/g, "") || "";
        if (ACCENT_WORDS.has(bare)) {
          word.classList.add("text-[#919F88]");
        } else if (HIGHLIGHT_WORDS.has(bare)) {
          word.classList.add(
            "bg-yellow-500",
            "px-2",
            "py-0",
            "rounded-lg",
            "font-bold",
          );
        } else if (BOLD_WORDS.has(bare)) {
          word.classList.add("font-bold");
        }
      });

      // Assemble the entrance sequence into a clean timeline
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        split.words,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", stagger: 0.1 },
      )
        .fromTo(
          [".get-started-btn", ".review-badge"],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", stagger: 0 },
          "-=0.5",
        )
        .fromTo(
          ".chat-bubble",
          { opacity: 0, scale: 0.8, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.4,
            ease: "elastic.out(1, 0.8)",
            stagger: 0.4,
          },
          "-=0.1",
        );

      tlRef.current = tl;
    },
    { scope: containerRef },
  );

  // Sync timeline state with parent-driven opacity
  useGSAP(
    () => {
      if (!tlRef.current) return;

      if (opacity > REVEAL_THRESHOLD && !hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        tlRef.current.play();
      } else if (opacity <= RESET_THRESHOLD && hasAnimatedRef.current) {
        hasAnimatedRef.current = false;
        tlRef.current.pause(0);
      }
    },
    { dependencies: [opacity], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 md:px-24 lg:px-32"
      style={{ opacity }}
    >
      <div className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-0 items-center">
        {/* Left Side: Painting (Huge, 2:3) */}
        <div className="relative w-[55%] md:w-[70%] max-h-[75vh] mx-auto">
          {/* Chat Message 1 */}
          <div className="chat-bubble absolute -top-6 -left-4 md:-top-10 md:-left-10 bg-odilon-logo text-[#d3ddcc] p-4 md:p-6 rounded-2xl shadow-2xl max-w-[200px] md:max-w-[280px] font-header text-sm md:text-xl z-20 transform -rotate-2 opacity-0">
            "Odilon Redon creates a bridge between our reality and hidden dreams."
            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-odilon-logo rotate-45" />
          </div>

          <div className="relative aspect-[2/3] w-full shadow-2xl overflow-hidden rounded-sm ring-1 ring-odilon-logo/10">
            <Image
              src={getPaintingPath(closedEyes?.src || "")}
              alt={
                closedEyes
                  ? `${closedEyes.title} - ${closedEyes.artist}`
                  : "Painting"
              }
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Chat Message 2 */}
          <div className="chat-bubble absolute -bottom-6 -right-4 md:-bottom-10 md:-right-10 bg-odilon-logo text-[#d3ddcc] p-4 md:p-6 rounded-2xl shadow-2xl max-w-[200px] md:max-w-[280px] font-header text-sm md:text-xl z-20 transform rotate-2 opacity-0">
            "The closed eyes invite us to look within our own spirits."
            <div className="absolute -top-2 right-8 w-4 h-4 bg-odilon-logo rotate-45" />
          </div>
        </div>

        {/* Right Side: Programmatic Text */}
        <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left max-w-xl">
          <div
            ref={textRef}
            className="space-y-3 md:space-y-6 flex flex-col items-center md:items-start"
          >
            <div className="hidden md:block font-logo text-lg md:text-2xl lg:text-3xl text-odilon-heading leading-[1.15] tracking-tight border-b-2 md:border-b-4 border-[#919F88] font-bold w-fit">
              odilon
            </div>
            <p className="font-header text-3xl md:text-5xl lg:text-6xl text-odilon-heading leading-[1.15] tracking-tight">
              AI that explores <br /> and appreciates art.
            </p>
            <p className="font-body text-3xl md:text-5xl lg:text-6xl text-odilon-heading leading-[1.15] tracking-tight">
              & becomes its voice.
            </p>
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 mt-6 md:mt-10">
              <button
                onClick={() => router.push("/signup")}
                className="get-started-btn px-10 md:px-12 py-4 md:py-5 bg-[#EBEBEB] text-odilon-heading font-header text-xl md:text-2xl rounded-sm shadow-[inset_0_2px_5px_rgba(0,0,0,0.2),0_10px_15px_rgba(0,0,0,0.1)] hover:bg-[#F3F4F6] hover:scale-105 active:scale-95 transition-colors duration-500 pointer-events-auto cursor-pointer opacity-0"
              >
                Join now
              </button>
              <SocialProof className="opacity-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
