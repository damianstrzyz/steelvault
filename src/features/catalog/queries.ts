import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { PAGE_SIZE } from "./constants";
import { useAuth } from "@/features/auth/authContext";
import { type CatalogSource, fetchCatalogPage, fetchCategories, fetchProductBySlug, fetchRelatedProducts, fetchSets } from "./api";
import type { CatalogFilters, ProductDetail, RelatedProducts } from "./types";

export function useCatalogProducts(filters: CatalogFilters, source: CatalogSource = "catalog") {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["catalog", source, source === "missing" ? user?.id ?? null : null, filters],
    queryFn: ({ pageParam }) => fetchCatalogPage(filters, pageParam, source),
    enabled: source === "catalog" || Boolean(user),
    initialPageParam: 0,
    getNextPageParam: (last) => ((last.page + 1) * PAGE_SIZE < last.total ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: 10 * 60_000 });
}

export function useSets() {
  return useQuery({ queryKey: ["sets"], queryFn: fetchSets, staleTime: 10 * 60_000 });
}

export function useProduct(slug: string) {
  return useQuery({ queryKey: ["product", slug], queryFn: () => fetchProductBySlug(slug), enabled: slug !== "" });
}

const noRelated: RelatedProducts = { variants: [], sameSet: [] };

export function useRelatedProducts(product: ProductDetail | null | undefined) {
  return useQuery({
    queryKey: ["related", product?.id],
    queryFn: () => (product ? fetchRelatedProducts(product) : Promise.resolve(noRelated)),
    enabled: Boolean(product),
  });
}
