"use client";

import React from "react";

const guides = [
  { y: "100vh", label: "01 / DESCENT" },
  { y: "200vh", label: "02 / REVELATION" },
  { y: "300vh", label: "03 / ASCENSION" },
  { y: "400vh", label: "04 / CALL" },
];

export const ScrollGuides = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {guides.map((guide, i) => (
        <div 
          key={i} 
          className="absolute w-full flex items-center px-10 gap-4"
          style={{ top: guide.y }}
        >
          <div className="h-[1px] flex-grow bg-headings-logo opacity-10" />
          <span className="font-body text-[9px] tracking-[0.3em] uppercase text-headings-logo opacity-40 whitespace-nowrap">
            {guide.label}
          </span>
          <div className="h-[1px] w-24 bg-headings-logo opacity-10" />
        </div>
      ))}
    </div>
  );
};
