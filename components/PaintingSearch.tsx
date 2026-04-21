"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, CornerDownLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { PAINTINGS } from "@/lib/paintings";
import { toast } from "sonner";

interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  image_id: string;
}

interface PaintingSearchProps {
  className?: string;
  containerClassName?: string;
  placeholder?: string;
}

import { useAuth } from "@/hooks/queries/useAuth";
import { useSearchArtworks } from "@/hooks/queries/usePaintings";
import { useCreateConversation } from "@/hooks/queries/useChats";

export function PaintingSearch({
  className = "",
  containerClassName = "",
  placeholder,
}: PaintingSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Artwork[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: isLoggedIn = null } = useAuth();
  const searchMutation = useSearchArtworks();
  const createMutation = useCreateConversation();

  const closedEyes = PAINTINGS.find((p) => p.id === "closed-eyes");
  const defaultPlaceholder = closedEyes
    ? `${closedEyes.title} - ${closedEyes.artist}`
    : "Talk to paintings...";

  const searchArtworks = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    if (isLoggedIn === null) return;

    // Rate Limiting Logic (Simplified for brevity, but still functional)
    if (!isLoggedIn) {
      const guestQueries = parseInt(localStorage.getItem("odilon_guest_queries") || "0");
      if (guestQueries >= 3) {
        toast.info("You've reached the guest limit. Join us to continue exploring.");
        router.push("/signup");
        return;
      }
      localStorage.setItem("odilon_guest_queries", (guestQueries + 1).toString());
    } else {
      const now = Date.now();
      const queryHistory = JSON.parse(localStorage.getItem("odilon_user_query_history") || "[]");
      const recentQueries = queryHistory.filter((t: number) => now - t < 120000);
      if (recentQueries.length >= 10) {
        toast.warning("You're moving fast! Take a moment to breathe with the art.");
        return;
      }
      localStorage.setItem("odilon_user_query_history", JSON.stringify([...recentQueries, now]));
    }

    try {
      const limit = isLoggedIn ? 10 : 6;
      const data = await searchMutation.mutateAsync({ query: searchTerm, limit });
      setResults(data as Artwork[] || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Error searching artworks:", error);
      toast.error("Failed to search artworks. Please try again.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchArtworks(query);
  };

  const handleSelect = async (artwork: Artwork) => {
    if (!isLoggedIn) {
      setIsOpen(false);
      router.push("/signup");
      toast.info("Join us to start your conversation with art.");
      return;
    }

    try {
      const chatId = await createMutation.mutateAsync(artwork);
      setIsOpen(false);
      router.push(`/chat/${chatId}`);
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        setIsOpen(false);
        router.push("/signup");
        toast.info("Join us to start your conversation with art.");
        return;
      }
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  const isLoading = searchMutation.isPending;
  const isCreating = createMutation.isPending;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative group ${containerClassName}`} ref={dropdownRef}>
      <form
        onSubmit={handleSearch}
        className="flex items-stretch overflow-hidden"
      >
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || defaultPlaceholder}
            className={`w-full text-odilon-logo text-lg sm:text-lg lg:text-xl placeholder:text-odilon-logo/40 outline-none transition-colors px-5 py-3 pr-12 text-left font-body bg-[#F3F4F6] shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)] hover:bg-white focus:bg-white rounded-l-lg border-y border-l border-transparent focus:border-odilon-logo/20 ${className}`}
          />
          <div
            className={`absolute right-4 pointer-events-none text-odilon-logo/30 transition-opacity duration-300 ${query ? "opacity-100" : "opacity-0"}`}
          >
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-body">
              <CornerDownLeft className="w-3 h-3" />
              <span>Enter</span>
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-odilon-accent text-odilon-heading px-6 rounded-r-lg hover:bg-odilon-heading hover:text-odilon-card transition-all duration-300 flex items-center justify-center group-hover:shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-odilon-logo/10 rounded-lg shadow-2xl z-[999] overflow-hidden overflow-y-auto max-h-80 md:max-h-96 lg:max-h-[30rem] scrollbar-thin scrollbar-thumb-odilon-logo/10 divide-y divide-odilon-logo/5 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          {results.map((artwork) => (
            <button
              key={artwork.id}
              onClick={() => handleSelect(artwork)}
              className="w-full flex items-center gap-4 p-4 hover:bg-odilon-accent/10 transition-colors text-left group/item cursor-pointer"
            >
              <div className="relative w-16 h-16 flex-shrink-0 bg-odilon-logo/5 rounded-sm overflow-hidden border border-odilon-logo/10">
                {artwork.image_id ? (
                  <img
                    src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`}
                    alt={artwork.title}
                    className="object-cover w-full h-full group-hover/item:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-odilon-logo/30 px-1 text-center font-header">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-header text-odilon-logo truncate group-hover/item:text-odilon-heading transition-colors">
                  {artwork.title}
                </h4>
                <p className="font-body text-sm text-odilon-logo/60 truncate mb-1">
                  {artwork.artist_display}
                </p>
                <div className="flex">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-header uppercase tracking-wider text-odilon-accent group-hover/item:underline underline-offset-4 transition-all duration-300">
                    <Sparkles className="w-2.5 h-2.5" />
                    Talk to this painting
                  </span>
                </div>
              </div>
              <div className="text-odilon-accent opacity-0 group-hover/item:opacity-100 transition-all pr-2 translate-x-1 group-hover/item:translate-x-0">
                →
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
