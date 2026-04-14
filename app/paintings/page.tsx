import React from "react";
import { getLibraryPaintings, getUniqueArtists, seedFeaturedPaintings } from "@/app/actions/paintings";
import { MasonryGrid } from "@/components/MasonryGrid";
import { ChatSidebar } from "@/components/ChatSidebar";
import { DashboardClient } from "@/app/dashboard/DashboardClient";
import Link from "next/link";
import { Search } from "lucide-react";
import { LibraryFilters } from "@/components/LibraryFilters";

interface PaintingsPageProps {
  searchParams: Promise<{
    query?: string;
    artist?: string;
    page?: string;
  }>;
}

export default async function PaintingsPage({ searchParams }: PaintingsPageProps) {
  const { query = "", artist = "", page = "1" } = await searchParams;
  const currentPage = parseInt(page);
  
  // Fetch data
  let data = await getLibraryPaintings({
    page: currentPage,
    search: query,
    artist: artist,
    limit: 30
  });

  // If DB is empty, seed it and refetch
  if (data.paintings.length === 0 && !query && !artist) {
    await seedFeaturedPaintings();
    data = await getLibraryPaintings({ page: currentPage, limit: 30 });
  }

  const artists = await getUniqueArtists();

  return (
    <DashboardClient>
      <div className="flex flex-col w-full min-h-full">
        {/* Library Header */}
        <header className="px-4 md:px-8 lg:px-12 py-12 space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-odilon-logo/10">
            <div className="space-y-4">
              <h1 className="font-logo text-7xl text-odilon-logo lowercase tracking-tighter">
                the library
              </h1>
              <p className="font-body text-odilon-logo/60 max-w-lg">
                The collective memory of Odilon. Explore the masterpieces gathered by the seekers of beauty and wisdom.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <LibraryFilters 
                initialQuery={query}
                initialArtist={artist}
                artists={artists}
              />
            </div>
          </div>
        </header>

        {/* Library Grid */}
        <div className="flex-1">
          <MasonryGrid paintings={data.paintings} />
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <footer className="px-4 md:px-8 lg:px-12 py-12 flex items-center justify-center gap-8">
            <Link
              href={`/paintings?query=${query}&artist=${artist}&page=${currentPage - 1}`}
              className={cn(
                "font-header text-xs uppercase tracking-[0.3em] transition-all",
                currentPage <= 1 ? "opacity-20 pointer-events-none" : "text-odilon-logo/40 hover:text-odilon-logo"
              )}
            >
              ← Previous Era
            </Link>
            
            <div className="font-header text-[10px] uppercase tracking-widest text-odilon-logo/40">
              Chapter {currentPage} of {data.totalPages}
            </div>

            <Link
              href={`/paintings?query=${query}&artist=${artist}&page=${currentPage + 1}`}
              className={cn(
                "font-header text-xs uppercase tracking-[0.3em] transition-all",
                currentPage >= data.totalPages ? "opacity-20 pointer-events-none" : "text-odilon-logo/40 hover:text-odilon-logo"
              )}
            >
              Next Visions →
            </Link>
          </footer>
        )}
      </div>
    </DashboardClient>
  );
}

// Helper for type safety in Link className
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
