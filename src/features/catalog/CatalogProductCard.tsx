import { ProductCard } from "@/components/product/ProductCard";
import { preloadPage } from "@/app/pages";
import { cardImageProps } from "@/lib/storage";
import type { Ownership } from "@/features/collection/useOwnership";
import type { ProductListItem } from "./types";

export function CatalogProductCard({ product: p, ownership }: { product: ProductListItem; ownership: Ownership }) {
  const subtitle = [p.platform, p.region, p.product_code].filter(Boolean).join(" · ");
  return (
    <ProductCard
      to={`/products/${p.slug}`}
      name={p.name}
      subtitle={subtitle}
      badge={p.edition_name ?? undefined}
      {...cardImageProps(p.image_path)}
      onPrefetch={() => preloadPage("product")}
      owned={ownership.isOwned(p.id)}
      onToggleOwned={() => ownership.toggle(p.id, p.name)}
    />
  );
}
