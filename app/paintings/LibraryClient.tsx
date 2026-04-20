"use client";

import React, { useEffect } from "react";
import { useInfinitePaintings } from "@/hooks/queries/usePaintings";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Loader2 } from "lucide-react";
import { useIntersectionObserver } from "usehooks-ts";

interface LibraryClientProps {
  query: string;
  artist: string;
  initialData: any;
}

export function LibraryClient({ query, artist, initialData }: LibraryClientProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfinitePaintings({ search: query, artist });

  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0 });
  const isVisible = !!isIntersecting;

  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten the pages for the MasonryGrid
  const allPaintings = data?.pages.flatMap((page) => page.paintings) || initialData.paintings;

  return (
    <div className="flex flex-col w-full">
      <div className="flex-1">
        <MasonryGrid paintings={allPaintings} />
      </div>

      {/* Sentinel for Infinite Scroll */}
      <div 
        ref={ref} 
        className="py-12 flex justify-center items-center h-24"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-odilon-logo/40" />
            <span className="font-header text-[10px] uppercase tracking-widest text-odilon-logo/40">
              Conjuring more visions...
            </span>
          </div>
        ) : hasNextPage ? (
          <span className="font-header text-[10px] uppercase tracking-widest text-odilon-logo/20">
            Scroll to uncover more
          </span>
        ) : data?.pages && data.pages.length > 0 ? (
          <span className="font-header text-[10px] uppercase tracking-widest text-odilon-logo/20">
            You have reached the end of this era
          </span>
        ) : null}
      </div>
    </div>
  );
}
