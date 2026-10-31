import type { Currency } from "@/lib/currency";
import type { ProductListItem } from "@/features/catalog/types";

export type CollectionStatus = "owned" | "wishlist";
export type ItemCondition = "sealed" | "mint" | "good" | "fair" | "poor";

export interface CollectionItem {
  id: string;
  product_id: string;
  status: CollectionStatus;
  quantity: number;
  condition: ItemCondition | null;
  packaging_condition: ItemCondition | null;
  currency: Currency;
  purchase_price: number | null;
  current_value: number | null;
  purchase_date: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  products: ProductListItem;
}

export interface ItemPatch {
  quantity: number;
  condition: ItemCondition | null;
  packaging_condition: ItemCondition | null;
  currency: Currency;
  purchase_price: number | null;
  current_value: number | null;
  purchase_date: string | null;
  tags: string[];
  notes: string | null;
}

export interface CollectionCounts { catalog_total: number; owned_distinct: number; owned_quantity: number; wishlist_total: number }
export interface SetCompletion { set_id: string; set_name: string; total_products: number; owned_products: number }
