"use client";

import React from "react";
import Link from "next/link";
import { Chat } from "@/lib/db/schema";

interface RecentPaintingsProps {
  conversations: Chat[];
}

export function RecentPaintings({ conversations }: RecentPaintingsProps) {
  if (conversations.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h3 className="font-header text-[10px] uppercase tracking-[0.3em] text-[#483434]/40">
        Continue the dialogue
      </h3>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {conversations.slice(0, 8).map((chat) => {
          const artwork = chat.artworkData as any;
          return (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="group relative w-12 h-12 md:w-16 md:h-16 rounded-sm overflow-hidden border border-[#483434]/10 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500"
              title={artwork.title}
            >
              {artwork.image_id ? (
                <img
                  src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`}
                  alt={artwork.title}
                  className="object-cover w-full h-full transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full bg-[#E7D4B5] flex items-center justify-center text-[8px] text-center p-1">
                  {artwork.title}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
