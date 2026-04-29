import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getLibraryPaintings, getUniqueArtists, searchPaintings } from "@/app/actions/paintings";

export const PAINTING_KEYS = {
  all: ["paintings"] as const,
  lists: () => [...PAINTING_KEYS.all, "list"] as const,
  filtered: (filters: any) => [...PAINTING_KEYS.lists(), filters] as const,
  artists: () => [...PAINTING_KEYS.all, "artists"] as const,
  search: (query: string) => [...PAINTING_KEYS.all, "search", query] as const,
};

export function useInfinitePaintings(filters: { search?: string; artist?: string } = {}) {
  return useInfiniteQuery({
    queryKey: PAINTING_KEYS.filtered(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return getLibraryPaintings({
        page: pageParam,
        limit: 30,
        search: filters.search,
        artist: filters.artist,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
}

export function useSearchPaintings(query: string, limit: number) {
  return useQuery({
    queryKey: PAINTING_KEYS.search(query),
    queryFn: () => searchPaintings(query, limit),
    enabled: !!query.trim(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useArtists() {
  return useQuery({
    queryKey: PAINTING_KEYS.artists(),
    queryFn: getUniqueArtists,
    staleTime: 1000 * 60 * 60, // Artists don't change often
  });
}
