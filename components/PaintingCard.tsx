"use client";

import React, { useState } from "react";
import { Painting } from "@/lib/db/schema";
import { createConversation } from "@/app/actions/chat";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaintingCardProps {
  painting: Painting;
}

export function PaintingCard({ painting }: PaintingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    setIsCreating(true);
    try {
      // Create conversation expects the artwork object structure
      const artwork = {
        id: Number(painting.id),
        title: painting.title,
        artist_display: painting.artistDisplay,
        image_id: painting.imageId,
        ...((painting.fullData as any) || {}),
      };
      const chatId = await createConversation(artwork);
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start conversation. Are you logged in?");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="break-inside-avoid mb-2 sm:mb-6 group relative rounded-sm overflow-hidden bg-odilon-card border border-odilon-logo/5 shadow-sm hover:shadow-2xl transition-all duration-500 animate-in fade-in duration-1000 scale-95 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      <div className="relative aspect-auto">
        {painting.imageId ? (
          <img
            src={`https://www.artic.edu/iiif/2/${painting.imageId}/full/400,/0/default.jpg`}
            alt={painting.title}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="aspect-[3/4] flex items-center justify-center bg-odilon-logo/5 text-odilon-logo/20 font-header uppercase tracking-tighter text-2xl">
            No Image
          </div>
        )}

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-odilon-logo/90 via-odilon-logo/40 to-transparent transition-opacity duration-500 flex flex-col justify-end p-2",
            isHovered
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          <div
            className={cn(
              "space-y-1 sm:space-y-2 translate-y-4 transition-transform duration-500",
              isHovered ? "translate-y-0" : "",
            )}
          >
            <h3 className="font-header text-xs sm:text-lg text-odilon-card leading-tight line-clamp-2">
              {painting.title}
            </h3>
            <p className="font-body text-[8px] sm:text-xs text-odilon-card/70 uppercase tracking-widest truncate">
              {painting.artistDisplay}
            </p>
            <div className="">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartChat();
                }}
                disabled={isCreating}
                className="w-full py-1 cursor-pointer bg-odilon-accent text-odilon-heading rounded-sm font-header text-[9px] sm:text-xs uppercase tracking-widest hover:bg-odilon-card hover:text-odilon-logo transition-all flex items-center justify-center gap-1 sm:gap-2"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Talk
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
