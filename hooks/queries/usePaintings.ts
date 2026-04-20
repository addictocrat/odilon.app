import { useInfiniteQuery, useQuery, useMutation } from "@tanstack/react-query";
import { getLibraryPaintings, getUniqueArtists, searchAndSyncArtworks } from "@/app/actions/paintings";

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

export function useSearchArtworks() {
  return useMutation({
    mutationFn: ({ query, limit }: { query: string; limit?: number }) => 
      searchAndSyncArtworks(query, limit),
  });
}

export function useArtists() {
  return useQuery({
    queryKey: PAINTING_KEYS.artists(),
    queryFn: getUniqueArtists,
    staleTime: 1000 * 60 * 60, // Artists don't change often
  });
}
