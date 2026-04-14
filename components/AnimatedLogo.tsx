"use client";

import React, { useEffect, useRef } from "react";
import { createTimeline, animate, svg, stagger } from "animejs";

const letters = [
  {
    key: "o1",
    path: "M 27.301 53.601 Q 19.101 53.601 12.951 50.301 Q 6.801 47.001 3.401 41.001 Q 0.001 35.001 0.001 26.801 Q 0.001 18.601 3.401 12.601 Q 6.801 6.601 12.951 3.301 Q 19.101 0.001 27.301 0.001 Q 35.501 0.001 41.601 3.301 Q 47.701 6.601 51.101 12.601 Q 54.501 18.601 54.501 26.801 Q 54.501 35.001 51.101 41.001 Q 47.701 47.001 41.601 50.301 Q 35.501 53.601 27.301 53.601 Z M 27.201 52.301 Q 24.101 52.301 21.551 49.101 Q 19.001 45.901 17.501 40.101 Q 16.001 34.301 16.001 26.701 Q 16.001 19.801 17.401 14.001 Q 18.801 8.201 21.351 4.701 Q 23.901 1.201 27.301 1.201 Q 30.501 1.201 33.051 4.451 Q 35.601 7.701 37.051 13.451 Q 38.501 19.201 38.501 26.701 Q 38.501 33.601 37.101 39.451 Q 35.701 45.301 33.201 48.801 Q 30.701 52.301 27.201 52.301 Z",
    fillPath: "M 27.301 53.601 Q 19.101 53.601 12.951 50.301 Q 6.801 47.001 3.401 41.001 Q 0.001 35.001 0.001 26.801 Q 0.001 18.601 3.401 12.601 Q 6.801 6.601 12.951 3.301 Q 19.101 0.001 27.301 0.001 Q 35.501 0.001 41.601 3.301 Q 47.701 6.601 51.101 12.601 Q 54.501 18.601 54.501 26.801 Q 54.501 35.001 51.101 41.001 Q 47.701 47.001 41.601 50.301 Q 35.501 53.601 27.301 53.601 Z M 27.201 52.301 Q 30.701 52.301 33.201 48.801 Q 35.701 45.301 37.101 39.451 Q 38.501 33.601 38.501 26.701 Q 38.501 19.201 37.051 13.451 Q 35.601 7.701 33.051 4.451 Q 30.501 1.201 27.301 1.201 Q 23.901 1.201 21.351 4.701 Q 18.801 8.201 17.401 14.001 Q 16.001 19.801 16.001 26.701 Q 16.001 34.301 17.501 40.101 Q 19.001 45.901 21.551 49.101 Q 24.101 52.301 27.201 52.301 Z",
    viewBox: "0 0 54.501 53.601",
    width: 54.5,
    height: 53.6,
  },
  {
    key: "d",
    path: "M 37.601 82.6 L 36.601 82.6 L 36.501 68.4 Q 34.101 73.6 29.301 76.95 Q 24.501 80.3 19.001 80.3 Q 13.601 80.3 9.301 76.9 Q 5.001 73.5 2.501 67.55 Q 0.001 61.6 0.001 54.1 Q 0.001 45.7 3.151 39.5 Q 6.301 33.3 11.901 29.95 Q 17.501 26.6 24.801 26.6 Q 28.901 26.6 31.501 27.85 Q 34.101 29.1 36.201 32.1 L 36.201 12.8 Q 36.201 9.2 33.951 7 Q 31.701 4.8 28.101 4.8 L 28.101 3.8 L 38.301 3.8 Q 43.301 3.8 45.901 2.8 Q 48.501 1.8 49.601 0 L 50.601 0 L 50.601 69.8 Q 50.601 73.4 52.801 75.6 Q 55.001 77.8 58.701 77.8 L 58.701 78.8 L 48.501 78.8 Q 44.101 78.8 41.551 79.7 Q 39.001 80.6 37.601 82.6 Z M 36.201 65.9 Q 35.301 68.6 33.401 71 Q 31.501 73.4 29.151 74.85 Q 26.801 76.3 24.501 76.3 Q 16.001 76.3 16.001 54.4 Q 16.001 41.5 18.801 34.9 Q 21.701 28.3 26.901 28.3 Q 30.801 28.3 33.251 31.9 Q 35.701 35.5 36.201 41.5 L 36.201 65.9 Z",
    fillPath: "M 37.601 82.6 L 36.601 82.6 L 36.501 68.4 Q 34.101 73.6 29.301 76.95 Q 24.501 80.3 19.001 80.3 Q 13.601 80.3 9.301 76.9 Q 5.001 73.5 2.501 67.55 Q 0.001 61.6 0.001 54.1 Q 0.001 45.7 3.151 39.5 Q 6.301 33.3 11.901 29.95 Q 17.501 26.6 24.801 26.6 Q 28.901 26.6 31.501 27.85 Q 34.101 29.1 36.201 32.1 L 36.201 12.8 Q 36.201 9.2 33.951 7 Q 31.701 4.8 28.101 4.8 L 28.101 3.8 L 38.301 3.8 Q 43.301 3.8 45.901 2.8 Q 48.501 1.8 49.601 0 L 50.601 0 L 50.601 69.8 Q 50.601 73.4 52.801 75.6 Q 55.001 77.8 58.701 77.8 L 58.701 78.8 L 48.501 78.8 Q 44.101 78.8 41.551 79.7 Q 39.001 80.6 37.601 82.6 Z M 36.201 65.9 L 36.201 41.5 Q 35.701 35.5 33.251 31.9 Q 30.801 28.3 26.901 28.3 Q 21.701 28.3 18.801 34.9 Q 16.001 41.5 16.001 54.4 Q 16.001 76.3 24.501 76.3 Q 26.801 76.3 29.151 74.85 Q 31.501 73.4 33.401 71 Q 35.301 68.6 36.201 65.9 Z",
    viewBox: "0 0 58.701 82.6",
    width: 58.7,
    height: 82.6,
  },
  {
    key: "i",
    path: "M 30.6 77.501 L 0 77.501 L 0 76.501 L 0.1 76.501 Q 3.7 76.501 5.9 74.301 Q 8.1 72.101 8.1 68.501 L 8.1 35.701 Q 8.1 31.901 6.55 29.801 Q 5 27.701 0 27.701 L 0 26.701 L 10.2 26.701 Q 15.3 26.701 18 25.601 Q 20.5 24.501 21.5 22.901 L 22.5 22.901 L 22.5 68.501 Q 22.5 72.101 24.7 74.301 Q 26.9 76.501 30.5 76.501 L 30.6 76.501 L 30.6 77.501 Z M 15.2 16.601 Q 11.6 16.601 9.25 14.251 Q 6.9 11.901 6.9 8.301 Q 6.9 4.701 9.25 2.351 Q 11.6 0.001 15.2 0.001 Q 18.7 0.001 21.05 2.401 Q 23.4 4.801 23.4 8.301 Q 23.4 11.801 21.05 14.201 Q 18.7 16.601 15.2 16.601 Z",
    fillPath: "M 30.6 77.501 L 0 77.501 L 0 76.501 L 0.1 76.501 Q 3.7 76.501 5.9 74.301 Q 8.1 72.101 8.1 68.501 L 8.1 35.701 Q 8.1 31.901 6.55 29.801 Q 5 27.701 0 27.701 L 0 26.701 L 10.2 26.701 Q 15.3 26.701 18 25.601 Q 20.5 24.501 21.5 22.901 L 22.5 22.901 L 22.5 68.501 Q 22.5 72.101 24.7 74.301 Q 26.9 76.501 30.5 76.501 L 30.6 76.501 L 30.6 77.501 Z M 15.2 16.601 Q 11.6 16.601 9.25 14.251 Q 6.9 11.901 6.9 8.301 Q 6.9 4.701 9.25 2.351 Q 11.6 0.001 15.2 0.001 Q 18.7 0.001 21.05 2.401 Q 23.4 4.801 23.4 8.301 Q 23.4 11.801 21.05 14.201 Q 18.7 16.601 15.2 16.601 Z",
    viewBox: "0 0 30.6 77.501",
    width: 30.6,
    height: 77.5,
  },
  {
    key: "l",
    path: "M 30.6 78.8 L 0 78.8 L 0 77.8 Q 3.6 77.8 5.85 75.65 Q 8.1 73.5 8.1 69.8 L 8.1 12.8 Q 8.1 9.2 5.85 7 Q 3.6 4.8 0 4.8 L 0 3.8 L 10.2 3.8 Q 15.3 3.8 18 2.7 Q 20.5 1.6 21.5 0 L 22.5 0 L 22.5 69.8 Q 22.5 73.5 24.75 75.65 Q 27 77.8 30.6 77.8 L 30.6 78.8 Z",
    fillPath: "M 30.6 78.8 L 0 78.8 L 0 77.8 Q 3.6 77.8 5.85 75.65 Q 8.1 73.5 8.1 69.8 L 8.1 12.8 Q 8.1 9.2 5.85 7 Q 3.6 4.8 0 4.8 L 0 3.8 L 10.2 3.8 Q 15.3 3.8 18 2.7 Q 20.5 1.6 21.5 0 L 22.5 0 L 22.5 69.8 Q 22.5 73.5 24.75 75.65 Q 27 77.8 30.6 77.8 L 30.6 78.8 Z",
    viewBox: "0 0 30.6 78.8",
    width: 30.6,
    height: 78.8,
  },
  {
    key: "o2",
    path: "M 27.301 53.601 Q 19.101 53.601 12.951 50.301 Q 6.801 47.001 3.401 41.001 Q 0.001 35.001 0.001 26.801 Q 0.001 18.601 3.401 12.601 Q 6.801 6.601 12.951 3.301 Q 19.101 0.001 27.301 0.001 Q 35.501 0.001 41.601 3.301 Q 47.701 6.601 51.101 12.601 Q 54.501 18.601 54.501 26.801 Q 54.501 35.001 51.101 41.001 Q 47.701 47.001 41.601 50.301 Q 35.501 53.601 27.301 53.601 Z M 27.201 52.301 Q 24.101 52.301 21.551 49.101 Q 19.001 45.901 17.501 40.101 Q 16.001 34.301 16.001 26.701 Q 16.001 19.801 17.401 14.001 Q 18.801 8.201 21.351 4.701 Q 23.901 1.201 27.301 1.201 Q 30.501 1.201 33.051 4.451 Q 35.601 7.701 37.051 13.451 Q 38.501 19.201 38.501 26.701 Q 38.501 33.601 37.101 39.451 Q 35.701 45.301 33.201 48.801 Q 30.701 52.301 27.201 52.301 Z",
    fillPath: "M 27.301 53.601 Q 19.101 53.601 12.951 50.301 Q 6.801 47.001 3.401 41.001 Q 0.001 35.001 0.001 26.801 Q 0.001 18.601 3.401 12.601 Q 6.801 6.601 12.951 3.301 Q 19.101 0.001 27.301 0.001 Q 35.501 0.001 41.601 3.301 Q 47.701 6.601 51.101 12.601 Q 54.501 18.601 54.501 26.801 Q 54.501 35.001 51.101 41.001 Q 47.701 47.001 41.601 50.301 Q 35.501 53.601 27.301 53.601 Z M 27.201 52.301 Q 30.701 52.301 33.201 48.801 Q 35.701 45.301 37.101 39.451 Q 38.501 33.601 38.501 26.701 Q 38.501 19.201 37.051 13.451 Q 35.601 7.701 33.051 4.451 Q 30.501 1.201 27.301 1.201 Q 23.901 1.201 21.351 4.701 Q 18.801 8.201 17.401 14.001 Q 16.001 19.801 16.001 26.701 Q 16.001 34.301 17.501 40.101 Q 19.001 45.901 21.551 49.101 Q 24.101 52.301 27.201 52.301 Z",
    viewBox: "0 0 54.501 53.601",
    width: 54.5,
    height: 53.6,
  },
  {
    key: "n",
    path: "M 30.6 54.6 L 0 54.6 L 0 53.6 L 0.1 53.6 Q 3.7 53.6 5.9 51.4 Q 8.1 49.2 8.1 45.6 L 8.1 12.8 Q 8.1 9 6.55 6.9 Q 5 4.8 0 4.8 L 0 3.8 L 9.9 3.8 Q 15 3.8 17.7 2.7 Q 20.2 1.6 21.2 0 L 22.2 0 L 22.3 14 Q 24.9 8.8 30.2 5.6 Q 35.5 2.4 41.4 2.4 Q 48.1 2.4 52.15 6.8 Q 56.2 11.2 56.2 18.4 L 56.2 45.6 Q 56.2 49.2 58.4 51.4 Q 60.6 53.6 64.2 53.6 L 64.3 53.6 L 64.3 54.6 L 33.8 54.6 L 33.8 53.6 L 33.9 53.6 Q 37.5 53.6 39.7 51.4 Q 41.9 49.2 41.9 45.6 L 41.9 17.4 Q 41.9 12.4 39.95 9.4 Q 38 6.4 34.8 6.4 Q 31.7 6.4 28.35 9.05 Q 25 11.7 22.5 16.2 L 22.5 45.6 Q 22.5 49.2 24.7 51.4 Q 26.9 53.6 30.5 53.6 L 30.6 53.6 L 30.6 54.6 Z",
    fillPath: "M 30.6 54.6 L 0 54.6 L 0 53.6 L 0.1 53.6 Q 3.7 53.6 5.9 51.4 Q 8.1 49.2 8.1 45.6 L 8.1 12.8 Q 8.1 9 6.55 6.9 Q 5 4.8 0 4.8 L 0 3.8 L 9.9 3.8 Q 15 3.8 17.7 2.7 Q 20.2 1.6 21.2 0 L 22.2 0 L 22.3 14 Q 24.9 8.8 30.2 5.6 Q 35.5 2.4 41.4 2.4 Q 48.1 2.4 52.15 6.8 Q 56.2 11.2 56.2 18.4 L 56.2 45.6 Q 56.2 49.2 58.4 51.4 Q 60.6 53.6 64.2 53.6 L 64.3 53.6 L 64.3 54.6 L 33.8 54.6 L 33.8 53.6 L 33.9 53.6 Q 37.5 53.6 39.7 51.4 Q 41.9 49.2 41.9 45.6 L 41.9 17.4 Q 41.9 12.4 39.95 9.4 Q 38 6.4 34.8 6.4 Q 31.7 6.4 28.35 9.05 Q 25 11.7 22.5 16.2 L 22.5 45.6 Q 22.5 49.2 24.7 51.4 Q 26.9 53.6 30.5 53.6 L 30.6 53.6 L 30.6 54.6 Z",
    viewBox: "0 0 64.3 54.6",
    width: 64.3,
    height: 54.6,
  },
];

export function AnimatedLogo({ 
  reverseTrigger = false, 
  color = "#483434",
  className = ""
}: { 
  reverseTrigger?: boolean;
  color?: string;
  className?: string;
}) {
  const containerRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const strokePaths = containerRef.current.querySelectorAll("path.stroke-path");
    const fillPaths = containerRef.current.querySelectorAll("path.fill-path");
    const drawables = svg.createDrawable(Array.from(strokePaths));

    const startForwardLoop = () => {
      if (timelineRef.current) timelineRef.current.pause();

      const tl = createTimeline({
        loop: false,
      });
      timelineRef.current = tl;

      // Forward Animation
      tl.add(drawables, {
        draw: ["0 0", "0 1"],
        duration: 1800,
        easing: (t: number) => t - Math.sin(t * 4 * Math.PI) / (4 * Math.PI),
        delay: stagger(120),
      });

      tl.add(Array.from(fillPaths), {
        opacity: 1,
        duration: 1200,
        easing: "easeInOutQuad",
        delay: stagger(80),
      }, "-=1000");
    };


    if (reverseTrigger) {
      if (timelineRef.current) timelineRef.current.pause();
      
      // Immediate Reverse
      const reverseTl = createTimeline();
      timelineRef.current = reverseTl;

      reverseTl.add(Array.from(fillPaths), {
        opacity: 0,
        duration: 300,
        easing: "easeOutQuad",
        delay: stagger(20, { from: "last" }),
      });

      reverseTl.add(drawables, {
        draw: ["0 1", "0 0"],
        duration: 400,
        easing: "easeOutQuad",
        delay: stagger(20, { from: "last" }),
      }, 0);
    } else {
      // If we are not in reverse, ensure forward loop is running
      // If it's the very first load, we wait 1s. Otherwise start immediately.
      if (!timelineRef.current) {
        animate(drawables, { draw: "0 0", duration: 0 });
        animate(Array.from(fillPaths), { opacity: 0, duration: 0 });
        
        const mountTimeout = setTimeout(() => {
          startForwardLoop();
        }, 1000);
        return () => clearTimeout(mountTimeout);
      } else {
        startForwardLoop();
      }
    }
  }, [reverseTrigger]);


  return (
    <div className={`w-full max-w-4xl mx-auto flex justify-center py-8 ${className}`}>
      <svg
        ref={containerRef}
        viewBox="0 0 302 90"
        className="w-full h-auto max-h-[22vw] overflow-visible select-none mix-blend-multiply drop-shadow-md"
      >
        {/* Letter O1 */}
        <g transform="translate(0, 33)">
          <path className="stroke-path" d={letters[0].path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="fill-path" d={letters[0].fillPath} fill={color} stroke="none" />
        </g>
        {/* Letter D */}
        <g transform="translate(60, 6.2)">
          <path className="stroke-path" d={letters[1].path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="fill-path" d={letters[1].fillPath} fill={color} stroke="none" />
        </g>
        {/* Letter I */}
        <g transform="translate(118.7, 7.5)">
          <path className="stroke-path" d={letters[2].path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="fill-path" d={letters[2].fillPath} fill={color} stroke="none" />
        </g>
        {/* Letter L */}
        <g transform="translate(149.3, 6.2)">
          <path className="stroke-path" d={letters[3].path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="fill-path" d={letters[3].fillPath} fill={color} stroke="none" />
        </g>
        {/* Letter O2 */}
        <g transform="translate(179.9, 33)">
          <path className="stroke-path" d={letters[4].path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="fill-path" d={letters[4].fillPath} fill={color} stroke="none" />
        </g>
        {/* Letter N */}
        <g transform="translate(234.4, 32)">
          <path className="stroke-path" d={letters[5].path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="fill-path" d={letters[5].fillPath} fill={color} stroke="none" />
        </g>
      </svg>
    </div>
  );
}
