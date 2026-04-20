import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSavedContents, generateRecommendations, saveContent, deleteContent, updateContent } from "@/app/actions/compass";
import { CompassContent } from "@/lib/db/schema";

export const COMPASS_KEYS = {
  all: ["compass"] as const,
  saved: () => [...COMPASS_KEYS.all, "saved"] as const,
  recommendations: (ids: string[], types: string[]) => [...COMPASS_KEYS.all, "recs", { ids, types }] as const,
};

export function useSavedCompassContents() {
  return useQuery({
    queryKey: COMPASS_KEYS.saved(),
    queryFn: getSavedContents,
  });
}

export function useRecommendations(selectedIds: string[], targetTypes: string[]) {
  return useMutation({
    mutationKey: COMPASS_KEYS.recommendations(selectedIds, targetTypes),
    mutationFn: () => generateRecommendations(selectedIds, targetTypes),
  });
}

export function useSaveCompassContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPASS_KEYS.saved() });
    },
  });
}

export function useDeleteCompassContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContent,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: COMPASS_KEYS.saved() });
      const previous = queryClient.getQueryData<CompassContent[]>(COMPASS_KEYS.saved());
      
      if (previous) {
        queryClient.setQueryData<CompassContent[]>(COMPASS_KEYS.saved(), (old) => 
          old?.filter(item => item.id !== id)
        );
      }
      
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(COMPASS_KEYS.saved(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMPASS_KEYS.saved() });
    },
  });
}

export function useUpdateCompassContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPASS_KEYS.saved() });
    },
  });
}
