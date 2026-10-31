import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Library, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { COLLECTION_SORT_OPTIONS } from "@/features/catalog/constants";
import { FilterBar } from "@/features/catalog/FilterBar";
import { useCatalogFilters } from "@/features/catalog/useCatalogFilters";
import { CollectionItemCard } from "./CollectionItemCard";
import { filterItems, sortItems } from "./filtering";
import { ItemEditor } from "./ItemEditor";
import { useCollectionActions, useCollectionItems } from "./queries";
import type { CollectionItem, CollectionStatus } from "./types";

const PAGE = 48;
const skeletons = Array.from({ length: 12 }, (_, i) => i);

export function CollectionItems({ status }: { status: CollectionStatus }) {
  const { filters, update, clearAll, activeCount } = useCatalogFilters();
  const query = useCollectionItems();
  const { markOwned } = useCollectionActions();
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => { setLimit(PAGE); }, [status, filters]);

  const forStatus = useMemo(() => (query.data ?? []).filter((i) => i.status === status), [query.data, status]);
  const visible = useMemo(() => sortItems(filterItems(forStatus, filters), filters.sort), [forStatus, filters]);
  const hasFilters = activeCount > 0 || filters.q !== "";

  let content;
  if (query.isPending) {
    content = <ProductGrid>{skeletons.map((i) => <ProductCardSkeleton key={i} />)}</ProductGrid>;
  } else if (query.isError) {
    content = <ErrorState message="We could not load your collection." onRetry={() => void query.refetch()} />;
  } else if (forStatus.length === 0) {
    content = status === "owned"
      ? <EmptyState icon={Library} title="Your collection is empty" description="Browse the catalog and tap the + button on a product to start your collection." action={<Link to="/" className={buttonStyles("primary")}>Browse the catalog</Link>} />
      : <EmptyState icon={Heart} title="Your wishlist is empty" description="Open a product and choose “Add to wishlist” to keep track of editions you want." action={<Link to="/" className={buttonStyles("primary")}>Browse the catalog</Link>} />;
  } else if (visible.length === 0) {
    content = <EmptyState icon={SearchX} title="No items match" description="Try removing a filter or searching for something else." action={hasFilters ? <Button variant="secondary" onClick={clearAll}>Clear filters</Button> : undefined} />;
  } else {
    content = (
      <>
        <ProductGrid>
          {visible.slice(0, limit).map((item) => (
            <CollectionItemCard key={item.id} item={item} onEdit={() => setEditing(item)} onMarkOwned={() => markOwned.mutate(item)} />
          ))}
        </ProductGrid>
        <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted" aria-live="polite">
          <span>Showing {Math.min(limit, visible.length).toLocaleString()} of {visible.length.toLocaleString()}</span>
          {visible.length > limit && <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>Show more</Button>}
        </div>
      </>
    );
  }

  return (
    <>
      <FilterBar filters={filters} update={update} clearAll={clearAll} activeCount={activeCount} sortOptions={COLLECTION_SORT_OPTIONS} showVariants={false} />
      {content}
      <ItemEditor item={editing} onClose={() => setEditing(null)} />
    </>
  );
}
