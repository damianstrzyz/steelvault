import type { CatalogFilters } from "@/features/catalog/types";
import type { CollectionItem } from "./types";

export function filterItems(items: CollectionItem[], f: CatalogFilters): CollectionItem[] {
  const term = f.q.trim().toLowerCase();
  return items.filter((i) => {
    const p = i.products;
    if (f.platform && p.platform !== f.platform) return false;
    if (f.region && p.region !== f.region) return false;
    if (f.category && p.category_id !== f.category) return false;
    if (f.set && p.set_id !== f.set) return false;
    if (f.kind && p.kind !== f.kind) return false;
    if (term) {
      const haystack = [p.name, p.edition_name ?? "", p.ean ?? "", p.product_code ?? "", ...i.tags].join(" ").toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

/** Descending compare with missing values always last. */
function byNumberDesc(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

function byDate(a: string | null, b: string | null, dir: 1 | -1): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -dir : a > b ? dir : 0;
}

export function sortItems(items: CollectionItem[], sort: CatalogFilters["sort"]): CollectionItem[] {
  const list = [...items];
  const name = (i: CollectionItem) => i.products.name;
  switch (sort) {
    case "name_desc": return list.sort((a, b) => name(b).localeCompare(name(a)));
    case "release_desc": return list.sort((a, b) => byDate(a.products.release_date, b.products.release_date, -1));
    case "release_asc": return list.sort((a, b) => byDate(a.products.release_date, b.products.release_date, 1));
    case "added_desc": return list.sort((a, b) => byDate(a.created_at, b.created_at, -1));
    case "value_desc": return list.sort((a, b) => byNumberDesc(a.current_value, b.current_value));
    case "price_desc": return list.sort((a, b) => byNumberDesc(a.purchase_price, b.purchase_price));
    default: return list.sort((a, b) => name(a).localeCompare(name(b)));
  }
}
