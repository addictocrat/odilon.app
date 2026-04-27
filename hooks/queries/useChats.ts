import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConversations, deleteConversation, createConversation } from "@/app/actions/chat";
import { Chat } from "@/lib/db/schema";

export const CHAT_KEYS = {
  all: ["chats"] as const,
  lists: () => [...CHAT_KEYS.all, "list"] as const,
  detail: (id: string) => [...CHAT_KEYS.all, "detail", id] as const,
};

export function useChats(initialData?: Chat[]) {
  return useQuery({
    queryKey: CHAT_KEYS.lists(),
    queryFn: async () => {
      const data = await getConversations();
      return data as Chat[];
    },
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    staleTime: 30 * 1000,
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    // Optimistic Update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: CHAT_KEYS.lists() });
      const previousChats = queryClient.getQueryData<Chat[]>(CHAT_KEYS.lists());

      if (previousChats) {
        queryClient.setQueryData<Chat[]>(CHAT_KEYS.lists(), (old) =>
          old?.filter((chat) => chat.id !== id)
        );
      }

      return { previousChats };
    },
    onError: (err, id, context) => {
      if (context?.previousChats) {
        queryClient.setQueryData(CHAT_KEYS.lists(), context.previousChats);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.lists() });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artworkData: any) => createConversation(artworkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.lists() });
    },
  });
}
