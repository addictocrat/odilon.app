import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/app/actions/auth";

export const AUTH_KEYS = {
  status: ["auth-status"] as const,
};

export function useAuth() {
  return useQuery({
    queryKey: AUTH_KEYS.status,
    queryFn: isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
  });
}
