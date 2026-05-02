import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getCreditBalance } from "@/lib/credits";

export function useCredits() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["credits", userId],
    queryFn: () => getCreditBalance(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
