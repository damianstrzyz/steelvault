import { supabase } from "@/lib/supabase";
import type { CategoryCompletion, ExchangeRate, FinancialRow, PlatformCompletion } from "./types";

export async function fetchFinancialBreakdown(): Promise<FinancialRow[]> {
  const { data, error } = await supabase.rpc("my_financial_breakdown");
  if (error) throw error;
  return (data ?? []) as FinancialRow[];
}

export async function fetchCategoryCompletion(): Promise<CategoryCompletion[]> {
  const { data, error } = await supabase.rpc("my_category_completion");
  if (error) throw error;
  return (data ?? []) as CategoryCompletion[];
}

export async function fetchPlatformCompletion(): Promise<PlatformCompletion[]> {
  const { data, error } = await supabase.rpc("my_platform_completion");
  if (error) throw error;
  return (data ?? []) as PlatformCompletion[];
}

export async function fetchExchangeRates(): Promise<ExchangeRate[]> {
  const { data, error } = await supabase.from("exchange_rates").select("currency, rate_per_eur, updated_at");
  if (error) throw error;
  return (data ?? []) as ExchangeRate[];
}
