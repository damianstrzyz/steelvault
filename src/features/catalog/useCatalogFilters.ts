import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { COLLECTION_SORT_OPTIONS, DEFAULT_SORT, SORT_OPTIONS, type SortKey } from "./constants";
import type { CatalogFilters } from "./types";

function parseSort(value: string | null): SortKey {
  return [...SORT_OPTIONS, ...COLLECTION_SORT_OPTIONS].find((o) => o.key === value)?.key ?? DEFAULT_SORT;
}

/** Filter state lives in the URL, so catalog views are shareable and survive refresh. */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<CatalogFilters>(() => ({
    q: params.get("q") ?? "",
    platform: params.get("platform") ?? "",
    region: params.get("region") ?? "",
    category: params.get("category") ?? "",
    set: params.get("set") ?? "",
    kind: params.get("kind") ?? "",
    variants: params.get("variants") === "1",
    sort: parseSort(params.get("sort")),
  }), [params]);

  const update = useCallback((patch: Partial<CatalogFilters>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "" || value === false || (key === "sort" && value === DEFAULT_SORT)) next.delete(key);
        else next.set(key, value === true ? "1" : String(value));
      }
      return next;
    }, { replace: true });
  }, [setParams]);

  // Keeps the ?tab= value so clearing filters on the collection page stays on the same tab.
  const clearAll = useCallback(() => setParams((prev) => {
    const next = new URLSearchParams();
    const tab = prev.get("tab");
    if (tab) next.set("tab", tab);
    return next;
  }, { replace: true }), [setParams]);

  const activeCount = [filters.platform, filters.region, filters.category, filters.set, filters.kind].filter(Boolean).length + (filters.variants ? 1 : 0);

  return { filters, update, clearAll, activeCount };
}
