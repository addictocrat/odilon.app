"use client";

import React from "react";
import Link from "next/link";
import { Chat, Painting } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useChats, useCreateConversation } from "@/hooks/queries/useChats";
import { MasonryGrid } from "./MasonryGrid";

interface RecentPaintingsProps {
  conversations: Chat[];
  emptyStatePaintings?: Painting[];
}

function EmptyStatePaintingCard({ painting }: { painting: Painting }) {
  const router = useRouter();
  const createMutation = useCreateConversation();

  const handleStartChat = async () => {
    try {
      const artwork = {
        id: painting.id,
        title: painting.title,
        artist_display: painting.artistDisplay,
        image_id: painting.imageId,
        image_url: painting.imageUrl,
        ...(painting.fullData as any),
      };
      const chatId = await createMutation.mutateAsync(artwork);
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start conversation. Are you logged in?");
    }
  };

  const isCreating = createMutation.isPending;

  return (
    <button
      onClick={handleStartChat}
      disabled={isCreating}
      className="group relative w-28 h-28 md:w-32 md:h-32 rounded-sm overflow-hidden border border-[#483434]/10 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500 disabled:opacity-50 cursor-pointer bg-transparent"
      title={painting.title}
    >
      {painting.imageUrl ? (
        <img
          src={painting.imageUrl}
          alt={painting.title}
          className="object-cover w-full h-full transition-all duration-700"
        />
      ) : (
        <div className="w-full h-full bg-[#E7D4B5] flex items-center justify-center text-[8px] text-center p-1">
          {painting.title}
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        {isCreating && <Loader2 className="w-4 h-4 text-white animate-spin" />}
      </div>
    </button>
  );
}

export function SuggestedPaintings({ paintings }: { paintings: Painting[] }) {
  if (paintings.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h3 className="font-header text-[10px] uppercase tracking-[0.3em] text-[#483434]/40">
        Discover a painting
      </h3>
      <MasonryGrid paintings={paintings} compact />
    </div>
  );
}

export function RecentPaintings({
  conversations: initialConversations,
  emptyStatePaintings = [],
}: RecentPaintingsProps) {
  const { data: conversations = initialConversations } = useChats(initialConversations);

  if (conversations.length === 0 && emptyStatePaintings.length === 0)
    return null;

  const hasConversations = conversations.length > 0;
  const paintingsToShow = hasConversations
    ? conversations
    : emptyStatePaintings;
  const headerText = hasConversations
    ? "Continue the dialogue"
    : "Begin your exploration";

  return (
    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h3 className="font-header text-[10px] uppercase tracking-[0.3em] text-[#483434]/40">
        {headerText}
      </h3>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {hasConversations
          ? // Show conversation artworks
            conversations.slice(0, 8).map((chat) => {
              const artwork = chat.artworkData as any;
              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="group relative w-12 h-12 md:w-16 md:h-16 rounded-sm overflow-hidden border border-[#483434]/10 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500"
                  title={artwork.title}
                >
                  {(artwork.image_url || artwork.image_id) ? (
                    <img
                      src={artwork.image_url || `https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`}
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
            })
          : // Show empty state paintings
            emptyStatePaintings
              .slice(0, 8)
              .map((painting) => (
                <EmptyStatePaintingCard key={painting.id} painting={painting} />
              ))}
      </div>
    </div>
  );
}
