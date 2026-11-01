import type { ReactNode } from "react";
import { Check, Pencil } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { preloadPage } from "@/app/pages";
import { cardImageProps } from "@/lib/storage";
import { formatMoney } from "@/lib/currency";
import { CONDITION_LABELS } from "./constants";
import type { CollectionItem } from "./types";

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-8 place-items-center rounded-lg border border-line hover:bg-surface-2">{children}</button>;
}

interface Props { item: CollectionItem; onEdit: () => void; onMarkOwned: () => void }

export function CollectionItemCard({ item, onEdit, onMarkOwned }: Props) {
  const p = item.products;
  const owned = item.status === "owned";
  const details = [
    item.quantity > 1 ? `×${item.quantity}` : null,
    item.condition ? CONDITION_LABELS[item.condition] : null,
    item.current_value !== null ? formatMoney(item.current_value, item.currency) : null,
  ].filter((d): d is string => d !== null);

  return (
    <ProductCard
      to={`/products/${p.slug}`}
      name={p.name}
      subtitle={[p.platform, p.region, p.product_code].filter(Boolean).join(" · ")}
      badge={p.edition_name ?? undefined}
      {...cardImageProps(p.image_path)}
      onPrefetch={() => preloadPage("product")}
      footer={
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-muted">{details.join(" · ") || (owned ? "No details yet" : "On wishlist")}</span>
          <div className="flex shrink-0 gap-1">
            {!owned && <IconButton label="Mark as owned" onClick={onMarkOwned}><Check className="size-4" /></IconButton>}
            <IconButton label="Edit details" onClick={onEdit}><Pencil className="size-4" /></IconButton>
          </div>
        </div>
      }
    />
  );
}
