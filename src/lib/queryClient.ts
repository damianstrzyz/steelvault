import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      // Try the request even when offline, so the service worker can answer from its cache
      // and uncached data fails fast with an error state instead of spinning forever.
      networkMode: "offlineFirst",
    },
    // Fail immediately offline (rolling back optimistic updates) instead of queueing silently.
    mutations: { networkMode: "always" },
  },
});
