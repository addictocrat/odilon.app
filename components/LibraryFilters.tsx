"use client";

import React from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface LibraryFiltersProps {
  initialQuery: string;
  initialArtist: string;
  artists: string[];
}

export function LibraryFilters({ initialQuery, initialArtist, artists }: LibraryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (query?: string, artist?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query !== undefined) {
      if (query) params.set("query", query);
      else params.delete("query");
    }
    
    if (artist !== undefined) {
      if (artist) params.set("artist", artist);
      else params.delete("artist");
    }
    
    params.set("page", "1");
    router.push(`/paintings?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search Form */}
      <form 
        className="relative group min-w-[300px]" 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          updateFilters(formData.get("query") as string);
        }}
      >
        <input
          name="query"
          defaultValue={initialQuery}
          placeholder="Search masterpieces..."
          className="w-full bg-odilon-card/50 border border-odilon-logo/10 rounded-sm py-3 px-10 outline-none focus:bg-white focus:border-odilon-accent/40 transition-all font-body text-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-odilon-logo/30 group-focus-within:text-odilon-accent" />
      </form>

      {/* Artist Filter */}
      <div className="relative group">
        <select 
          className="appearance-none bg-odilon-card/50 border border-odilon-logo/10 rounded-sm py-3 px-6 pr-10 outline-none focus:bg-white focus:border-odilon-accent/40 transition-all font-header text-xs uppercase tracking-widest text-odilon-logo/70 cursor-pointer max-w-[200px] truncate"
          onChange={(e) => updateFilters(undefined, e.target.value)}
          defaultValue={initialArtist}
        >
          <option value="">All Artists</option>
          {artists.map((a) => (
            <option key={a} value={a}>
              {a.length > 20 ? `${a.substring(0, 20)}...` : a}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-[8px] text-odilon-logo/40">▼</span>
        </div>
      </div>
    </div>
  );
}
