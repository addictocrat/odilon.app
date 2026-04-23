"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getConversations, deleteConversation } from "@/app/actions/chat";
import { Chat } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Sparkles, MessageSquare, Trash2 } from "lucide-react";

import { useChats, useDeleteChat } from "@/hooks/queries/useChats";

export function ChatSidebar({ initialData }: { initialData?: Chat[] }) {
  const router = useRouter();
  const params = useParams();
  const currentChatId = params.id as string;

  const { data: conversations = [], isLoading } = useChats(initialData);
  const deleteMutation = useDeleteChat();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to remove this vision from your history?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      
      if (currentChatId === id) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return (
    <div className="w-80 h-full bg-[#E7D4B5] border-r border-[#483434]/5 flex flex-col">
      <div className="p-6 border-b border-[#483434]/10">
        <h2 className="font-header text-sm uppercase tracking-[0.3em] text-[#483434] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B6C7AA]" />
          Past Visions
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="p-8 text-center space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-[#483434]/5 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-[#483434]/5 rounded w-3/4" />
                  <div className="h-2 bg-[#483434]/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-[#483434]/20" />
            <p className="font-body text-xs text-[#483434]/40">No conversations yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((chat) => {
              const artwork = chat.artworkData as any;
              const isActive = chat.id === currentChatId;

              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className={cn(
                    "group flex items-center gap-4 p-4 border-b border-[#483434]/5 transition-all hover:bg-[#F6E6CB]/50",
                    isActive ? "bg-[#F6E6CB] border-r-4 border-r-[#B6C7AA]" : ""
                  )}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-[#483434]/5 rounded-sm overflow-hidden border border-[#483434]/10">
                    {artwork.image_id ? (
                      <img
                        src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`}
                        alt={artwork.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-[#483434]/30 text-center font-header">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-header text-xs truncate transition-colors",
                      isActive ? "text-[#483434]" : "text-[#483434]/70"
                    )}>
                      {artwork.title}
                    </h4>
                    <p className="font-body text-[10px] text-[#6B4F4F]/60 truncate">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 p-2 text-[#483434]/30 hover:text-[#483434] transition-all rounded-full hover:bg-[#483434]/5",
                      isActive && "opacity-60" // Make it slightly visible if active
                    )}
                    title="Remove conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#483434]/10 bg-[#483434]/5">
        <Link 
          href="/paintings"
          className="block w-full text-center py-2 px-4 rounded-sm border border-[#483434]/20 text-[#483434]/60 hover:text-[#483434] hover:bg-[#E7D4B5] transition-all font-header text-[10px] uppercase tracking-widest"
        >
          Discover More Art
        </Link>
      </div>
    </div>
  );
}
