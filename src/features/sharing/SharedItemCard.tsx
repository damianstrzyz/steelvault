import { ProductCard } from "@/components/product/ProductCard";
import { CONDITION_LABELS } from "@/features/collection/constants";
import { formatMoney } from "@/lib/currency";
import { preloadPage } from "@/app/pages";
import { cardImageProps } from "@/lib/storage";
import type { SharedItem } from "./types";

export function SharedItemCard({ item }: { item: SharedItem }) {
  const details = [
    item.quantity > 1 ? `×${item.quantity}` : null,
    item.condition ? CONDITION_LABELS[item.condition] : null,
    item.current_value !== null ? formatMoney(item.current_value, item.currency) : null,
  ].filter((d): d is string => d !== null);

  return (
    <ProductCard
      to={`/products/${item.product_slug}`}
      name={item.product_name}
      subtitle={[item.platform, item.region, item.product_code].filter(Boolean).join(" · ")}
      badge={item.edition_name ?? undefined}
      {...cardImageProps(item.image_path)}
      onPrefetch={() => preloadPage("product")}
      footer={details.length > 0 ? <p className="mt-3 truncate text-xs text-muted">{details.join(" · ")}</p> : undefined}
    />
  );
}
