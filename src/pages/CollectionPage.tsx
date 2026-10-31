import { Link, useSearchParams } from "react-router-dom";
import { Share2 } from "lucide-react";
import { CatalogBrowser } from "@/features/catalog/CatalogBrowser";
import { useCatalogFilters } from "@/features/catalog/useCatalogFilters";
import { CollectionItems } from "@/features/collection/CollectionItems";
import { SetCompletionList } from "@/features/collection/SetCompletionList";
import { useCollectionCounts } from "@/features/collection/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SearchField } from "@/components/ui/SearchField";
import { Skeleton } from "@/components/ui/Skeleton";

type Tab = "owned" | "wishlist" | "missing";
const TABS: { key: Tab; label: string }[] = [
  { key: "owned", label: "Owned" },
  { key: "wishlist", label: "Wishlist" },
  { key: "missing", label: "Missing" },
];

function parseTab(value: string | null): Tab {
  return TABS.find((t) => t.key === value)?.key ?? "owned";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

export default function CollectionPage() {
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get("tab"));
  const { filters, update } = useCatalogFilters();
  const counts = useCollectionCounts();

  const setTab = (next: Tab) => setParams((prev) => { const p = new URLSearchParams(prev); p.set("tab", next); return p; }, { replace: true });
  const selectSet = (setId: string) => setParams((prev) => { const p = new URLSearchParams(prev); p.set("tab", "owned"); p.set("set", setId); return p; }, { replace: true });

  const c = counts.data;
  const missing = c ? Math.max(0, c.catalog_total - c.owned_distinct) : 0;
  const completion = c && c.catalog_total > 0 ? (c.owned_distinct / c.catalog_total) * 100 : 0;
  const tabCount: Record<Tab, number | null> = { owned: c?.owned_distinct ?? null, wishlist: c?.wishlist_total ?? null, missing: c ? missing : null };

  return (
    <>
      <PageHeader title="My collection" description="Everything you own, want and still need." actions={<Link to="/profile#sharing" className={buttonStyles("secondary")}><Share2 className="size-4" />Share</Link>} />

      <section className="mb-8">
        {c ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Owned products" value={c.owned_distinct.toLocaleString()} />
              <Stat label="Missing from catalog" value={missing.toLocaleString()} />
              <Stat label="On wishlist" value={c.wishlist_total.toLocaleString()} />
              <Stat label="Total copies (with duplicates)" value={c.owned_quantity.toLocaleString()} />
            </div>
            <div className="mt-4"><ProgressBar value={completion} label="Catalog completion" /></div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        )}
      </section>

      <SetCompletionList onSelectSet={selectSet} />

      <div role="tablist" aria-label="Collection views" className="mb-4 flex w-fit gap-1 rounded-xl border border-line bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t.key ? "bg-accent text-accent-ink" : "text-muted hover:text-fg"}`}
          >
            {t.label}{tabCount[t.key] !== null && <span className="ml-1.5 opacity-70">{tabCount[t.key]}</span>}
          </button>
        ))}
      </div>

      <div className="mb-4 max-w-md">
        <SearchField label="Search your collection" placeholder={tab === "missing" ? "Search missing products…" : "Search by title, EAN, code or tag…"} value={filters.q} onCommit={(q) => update({ q })} />
      </div>

      {tab === "missing" ? <CatalogBrowser source="missing" hideSearchChip /> : <CollectionItems status={tab} />}
    </>
  );
}
