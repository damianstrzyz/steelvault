import type { SortKey } from "./constants";

export type ProductKind = "game" | "steelbook" | "game_with_steelbook" | "other";

// Hand-written row shapes matching supabase/migrations. Replace with generated
// types (npm run types) once the Supabase CLI is linked.
export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  edition_name: string | null;
  platform: string;
  region: string;
  ean: string | null;
  product_code: string | null;
  release_date: string | null;
  image_path: string | null;
  parent_product_id: string | null;
  set_id: string | null;
  category_id: string | null;
  sets: { name: string } | null;
  categories: { name: string } | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  attributes: Record<string, unknown>;
  created_at: string;
}

export interface Category { id: string; slug: string; name: string }
export interface CatalogSet { id: string; slug: string; name: string; category_id: string | null }

export interface CatalogFilters {
  q: string;
  platform: string;
  region: string;
  category: string;
  set: string;
  kind: string;
  variants: boolean;
  sort: SortKey;
}

export interface CatalogPage { items: ProductListItem[]; total: number; page: number }
export interface RelatedProducts { variants: ProductListItem[]; sameSet: ProductListItem[] }
