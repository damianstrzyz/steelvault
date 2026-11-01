import type { Currency } from "@/lib/currency";

export interface FinancialRow {
  platform: string;
  category_id: string | null;
  currency: Currency;
  item_count: number;
  purchase_total: number;
  value_total: number;
  matched_cost: number;
  matched_value: number;
  unpriced_count: number;
}
export interface CategoryCompletion { category_id: string; category_name: string; total_products: number; owned_products: number }
export interface PlatformCompletion { platform: string; total_products: number; owned_products: number }
export interface ExchangeRate { currency: Currency; rate_per_eur: number; updated_at: string }
