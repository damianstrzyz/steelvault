import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LockKeyhole, PackageOpen, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { PLATFORMS } from "@/features/catalog/constants";
import type { CollectionStatus } from "@/features/collection/types";
import { useSharedInfo, useSharedItems } from "@/features/sharing/queries";
import { SharedItemCard } from "@/features/sharing/SharedItemCard";
import { useInView } from "@/lib/useInView";

const platformOptions = [{ value: "", label: "All platforms" }, ...PLATFORMS.map((p) => ({ value: p, label: p }))];
const skeletons = Array.from({ length: 12 }, (_, i) => i);

/** Asks search engines not to index shared collections. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    const title = document.title;
    document.title = "Shared collection · Steelvault";
    return () => { meta.remove(); document.title = title; };
  }, []);
}

export default function SharedCollectionPage() {
  const { shareId = "" } = useParams();
  useNoIndex();
  const info = useSharedInfo(shareId);
  const [status, setStatus] = useState<CollectionStatus>("owned");
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("");
  const filters = useMemo(() => ({ status, q, platform }), [status, q, platform]);
  const query = useSharedItems(shareId, filters, Boolean(info.data));

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const total = query.data?.pages[0]?.total ?? 0;
  const { fetchNextPage } = query;
  const loadMore = useCallback(() => { void fetchNextPage(); }, [fetchNextPage]);
  const sentinel = useInView<HTMLDivElement>(loadMore, query.hasNextPage && !query.isFetchingNextPage);

  if (info.isPending) return <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-64" /></div>;
  if (info.isError) return <ErrorState message="We could not load this collection." onRetry={() => void info.refetch()} />;
  if (!info.data) {
    return <EmptyState icon={LockKeyhole} title="This collection is not available" description="The link may be wrong, or the owner has turned sharing off." action={<Link to="/" className={buttonStyles("primary")}>Browse the catalog</Link>} />;
  }

  const owner = info.data.owner_display_name?.trim() || "A collector";
  const tabs: { key: CollectionStatus; label: string; count: number }[] = [{ key: "owned", label: "Collection", count: info.data.owned_count }];
  if (info.data.show_wishlist) tabs.push({ key: "wishlist", label: "Wishlist", count: info.data.wishlist_count });
  const filtered = q.trim() !== "" || platform !== "";

  let content;
  if (query.isPending) content = <ProductGrid>{skeletons.map((i) => <ProductCardSkeleton key={i} />)}</ProductGrid>;
  else if (query.isError) content = <ErrorState message="We could not load these items." onRetry={() => void query.refetch()} />;
  else if (items.length === 0) {
    content = filtered
      ? <EmptyState icon={SearchX} title="No items match" description="Try a different search or platform." action={<Button variant="secondary" onClick={() => { setQ(""); setPlatform(""); }}>Clear filters</Button>} />
      : <EmptyState icon={PackageOpen} title="Nothing here yet" description={`${owner} has not added anything to this list.`} />;
  } else {
    content = (
      <>
        <div className={query.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <ProductGrid>
            {items.map((item) => <SharedItemCard key={`${item.status}-${item.product_id}`} item={item} />)}
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
      <PageHeader title={`${owner}’s collection`} description={`${info.data.owned_count.toLocaleString()} ${info.data.owned_count === 1 ? "product" : "products"} · shared with you`} />
      {tabs.length > 1 && (
        <div role="tablist" aria-label="Shared views" className="mb-4 flex w-fit gap-1 rounded-xl border border-line bg-surface p-1">
          {tabs.map((t) => (
            <button key={t.key} role="tab" type="button" aria-selected={status === t.key} onClick={() => setStatus(t.key)} className={`rounded-lg px-4 py-2 text-sm font-medium ${status === t.key ? "bg-accent text-accent-ink" : "text-muted hover:text-fg"}`}>
              {t.label}<span className="ml-1.5 opacity-70">{t.count}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-60 flex-1 sm:max-w-md"><SearchField label="Search this collection" placeholder="Search by title, EAN or code…" value={q} onCommit={setQ} /></div>
        <Select label="Platform" value={platform} options={platformOptions} onChange={(e) => setPlatform(e.target.value)} />
      </div>
      {content}
    </>
  );
}
