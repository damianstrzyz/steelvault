import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/authContext";
import { fetchCategoryCompletion, fetchExchangeRates, fetchFinancialBreakdown, fetchPlatformCompletion } from "./api";

// Keys start with "collection" so any collection change invalidates them.
function useStatsQuery<T>(name: string, fn: () => Promise<T>) {
  const userId = useAuth().user?.id ?? "";
  return useQuery({ queryKey: ["collection", "stats", name, userId], queryFn: fn, enabled: userId !== "" });
}

export const useFinancialBreakdown = () => useStatsQuery("financial", fetchFinancialBreakdown);
export const useCategoryCompletion = () => useStatsQuery("categories", fetchCategoryCompletion);
export const usePlatformCompletion = () => useStatsQuery("platforms", fetchPlatformCompletion);

export function useExchangeRates() {
  return useQuery({ queryKey: ["exchange-rates"], queryFn: fetchExchangeRates, staleTime: 60 * 60_000 });
}
