import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Disc3, Heart, PackageX, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CatalogProductCard } from "@/features/catalog/CatalogProductCard";
import { KIND_LABELS } from "@/features/catalog/constants";
import { useProduct, useRelatedProducts } from "@/features/catalog/queries";
import type { ProductListItem } from "@/features/catalog/types";
import { useOwnership, type Ownership } from "@/features/collection/useOwnership";
import { useWishlist } from "@/features/collection/useWishlist";
import { detailImageProps } from "@/lib/storage";

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function labelFromKey(key: string): string {
  const spaced = key.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function RelatedSection({ title, items, ownership }: { title: string; items: ProductListItem[]; ownership: Ownership }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <ProductGrid>{items.map((p) => <CatalogProductCard key={p.id} product={p} ownership={ownership} />)}</ProductGrid>
    </section>
  );
}

export default function ProductDetailPage() {
  const { slug = "" } = useParams();
  const product = useProduct(slug);
  const related = useRelatedProducts(product.data);
  const ownership = useOwnership();
  const wishlist = useWishlist();
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (product.isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Skeleton className="aspect-[3/4]" />
        <div className="space-y-4"><Skeleton className="h-9 w-2/3" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-40" /></div>
      </div>
    );
  }
  if (product.isError) return <ErrorState message="We could not load this product." onRetry={() => void product.refetch()} />;
  const p = product.data;
  if (!p) {
    return <EmptyState icon={PackageX} title="Product not found" description="It may have been removed or the link is incorrect." action={<Link to="/" className={buttonStyles("primary")}>Back to catalog</Link>} />;
  }

  const image = detailImageProps(p.image_path);
  const owned = ownership.isOwned(p.id);
  const rows: [string, ReactNode][] = [
    ["Platform", p.platform],
    ["Region", p.region],
    ["Type", KIND_LABELS[p.kind] ?? p.kind],
    ["Edition", p.edition_name],
    ["EAN", p.ean],
    ["Product code", p.product_code],
    ["Release date", formatDate(p.release_date)],
    ["Category", p.categories?.name],
    ["Set", p.sets?.name],
  ];
  for (const [key, value] of Object.entries(p.attributes)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") rows.push([labelFromKey(key), String(value)]);
  }
  const visibleRows = rows.filter(([, v]) => v !== null && v !== undefined && v !== "");

  const status = !ownership.signedIn ? "Sign in to track this item in your collection."
    : owned === null ? "Checking your collection…"
    : owned ? "This item is in your collection." : "This item is not in your collection yet.";

  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted"><Link to="/" className="hover:text-fg">Catalog</Link> / <span className="text-fg">{p.name}</span></nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-surface-2">
          {image
            ? <img src={image.src} srcSet={image.srcSet} sizes="(min-width:1024px) 420px, 100vw" alt={p.name} decoding="async" fetchPriority="high" className="size-full object-cover" />
            : <div className="grid size-full place-items-center text-muted"><Disc3 className="size-16" aria-hidden="true" /></div>}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">{KIND_LABELS[p.kind] ?? p.kind}</Badge>
            {p.edition_name && <Badge>{p.edition_name}</Badge>}
            {p.parent_product_id && <Badge tone="neutral">Variant</Badge>}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{p.name}</h1>
          <p className="mt-1 text-muted">{[p.ean && `EAN ${p.ean}`, p.product_code].filter(Boolean).join(" · ") || "No identifiers listed"}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4">
            <p className={`flex-1 text-sm ${owned ? "text-ok" : "text-muted"}`}>{status}</p>
            <div className="flex flex-wrap gap-2">
              {owned ? (
                <Button variant="secondary" onClick={() => setConfirmRemove(true)}><Check className="size-4" />Remove from collection</Button>
              ) : (
                <>
                  <Button onClick={() => ownership.toggle(p.id, p.name)}><Plus className="size-4" />Add to collection</Button>
                  <Button variant="secondary" loading={wishlist.busy} onClick={() => wishlist.toggle(p.id, p.name)}>
                    <Heart className={`size-4 ${wishlist.isWishlisted(p.id) ? "fill-current text-accent" : ""}`} />
                    {wishlist.isWishlisted(p.id) ? "On wishlist" : "Add to wishlist"}
                  </Button>
                </>
              )}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {visibleRows.map(([label, value]) => (
              <div key={label} className="contents"><dt className="text-muted">{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          {p.description && <p className="mt-6 max-w-prose whitespace-pre-line text-muted">{p.description}</p>}
        </div>
      </div>

      {related.isError && <p className="mt-10 text-sm text-muted">Related products could not be loaded.</p>}
      <RelatedSection title="Other editions and variants" items={related.data?.variants ?? []} ownership={ownership} />
      <RelatedSection title={p.sets ? `More from ${p.sets.name}` : "More from this set"} items={related.data?.sameSet ?? []} ownership={ownership} />

      <ConfirmDialog
        open={confirmRemove}
        title="Remove from collection?"
        message={`${p.name} will be removed from your collection, including any notes or prices you saved for it.`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => { setConfirmRemove(false); ownership.toggle(p.id, p.name); }}
        onCancel={() => setConfirmRemove(false)}
      />
    </article>
  );
}
