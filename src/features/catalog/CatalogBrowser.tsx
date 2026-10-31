import { useCallback, useMemo, type ReactNode } from "react";
import { PackageOpen, PartyPopper, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { useOwnership } from "@/features/collection/useOwnership";
import { useInView } from "@/lib/useInView";
import type { CatalogSource } from "./api";
import { CatalogProductCard } from "./CatalogProductCard";
import { SORT_OPTIONS } from "./constants";
import { FilterBar } from "./FilterBar";
import { useCatalogProducts } from "./queries";
import { useCatalogFilters } from "./useCatalogFilters";

const skeletons = Array.from({ length: 12 }, (_, i) => i);

interface CatalogBrowserProps { source: CatalogSource; hideSearchChip?: boolean }

/** Filterable, infinitely scrolling product grid. "missing" shows only products the user does not own. */
export function CatalogBrowser({ source, hideSearchChip = false }: CatalogBrowserProps) {
  const { filters, update, clearAll, activeCount } = useCatalogFilters();
  const query = useCatalogProducts(filters, source);
  const ownership = useOwnership();

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const total = query.data?.pages[0]?.total ?? 0;
  const hasFilters = activeCount > 0 || filters.q !== "";

  const { fetchNextPage } = query;
  const loadMore = useCallback(() => { void fetchNextPage(); }, [fetchNextPage]);
  const sentinel = useInView<HTMLDivElement>(loadMore, query.hasNextPage && !query.isFetchingNextPage);

  let content: ReactNode;
  if (query.isPending) {
    content = <ProductGrid>{skeletons.map((i) => <ProductCardSkeleton key={i} />)}</ProductGrid>;
  } else if (query.isError) {
    content = <ErrorState message="We could not load the products." onRetry={() => void query.refetch()} />;
  } else if (items.length === 0) {
    content = hasFilters
      ? <EmptyState icon={SearchX} title="No products match" description="Try removing a filter or searching for a different title, EAN or product code." action={<Button variant="secondary" onClick={clearAll}>Clear filters</Button>} />
      : source === "missing"
        ? <EmptyState icon={PartyPopper} title="Nothing missing" description="You own every product in the catalog, or the catalog is still empty." />
        : <EmptyState icon={PackageOpen} title="The catalog is empty" description="No products have been added yet. See docs/IMPORTING_CATALOG.md to import your first products." />;
  } else {
    content = (
      <>
        <div className={query.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <ProductGrid>
            {items.map((p) => <CatalogProductCard key={p.id} product={p} ownership={ownership} />)}
            {query.isFetchingNextPage && skeletons.slice(0, 6).map((i) => <ProductCardSkeleton key={`s${i}`} />)}
          </ProductGrid>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted" aria-live="polite">
          <span>Showing {items.length.toLocaleString()} of {total.toLocaleString()}</span>
          {query.hasNextPage && (
            <>
              <div ref={sentinel} aria-hidden="true" />
              <Button variant="secondary" loading={query.isFetchingNextPage} onClick={loadMore}>Load more</Button>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {!hideSearchChip && filters.q && (
        <p className="mb-4 flex items-center gap-2 text-sm text-muted">
          Results for “{filters.q}”
          <button type="button" onClick={() => update({ q: "" })} aria-label="Clear search" className="grid size-6 place-items-center rounded-full hover:bg-surface-2"><X className="size-4" /></button>
        </p>
      )}
      <FilterBar filters={filters} update={update} clearAll={clearAll} activeCount={activeCount} sortOptions={SORT_OPTIONS} />
      {content}
    </>
  );
}
