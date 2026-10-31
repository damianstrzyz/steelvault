import type { Currency } from "@/lib/currency";
import type { ProductKind } from "@/features/catalog/types";
import type { CollectionStatus, ItemCondition } from "@/features/collection/types";

export interface CollectionShare {
  user_id: string;
  share_id: string;
  is_enabled: boolean;
  show_prices: boolean;
  show_wishlist: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharingOptions { enabled: boolean; showPrices: boolean; showWishlist: boolean }

export interface SharedInfo {
  owner_display_name: string | null;
  show_prices: boolean;
  show_wishlist: boolean;
  owned_count: number;
  wishlist_count: number;
}

export interface SharedItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  kind: ProductKind;
  edition_name: string | null;
  platform: string;
  region: string;
  ean: string | null;
  product_code: string | null;
  release_date: string | null;
  image_path: string | null;
  set_name: string | null;
  category_name: string | null;
  status: CollectionStatus;
  quantity: number;
  condition: ItemCondition | null;
  currency: Currency;
  current_value: number | null;
  total_count: number;
}

export interface SharedFilters { status: CollectionStatus; q: string; platform: string }
export interface SharedPage { items: SharedItem[]; total: number; page: number }
