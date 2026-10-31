import { supabase } from "@/lib/supabase";
import { PRODUCT_LIST_COLUMNS } from "@/features/catalog/api";
import type { CollectionCounts, CollectionItem, CollectionStatus, ItemPatch, SetCompletion } from "./types";

const BATCH = 1000;
const ITEM_COLUMNS = `id, product_id, status, quantity, condition, packaging_condition, currency, purchase_price, current_value, purchase_date, tags, notes, created_at, products(${PRODUCT_LIST_COLUMNS})`;

/** Product ids the user has with the given status. Paged because the API caps a response at 1000 rows. */
export async function fetchProductIdsByStatus(userId: string, status: CollectionStatus): Promise<Set<string>> {
  const ids = new Set<string>();
  for (let from = 0; ; from += BATCH) {
    const { data, error } = await supabase
      .from("user_collection").select("product_id")
      .eq("user_id", userId).eq("status", status)
      .order("product_id").range(from, from + BATCH - 1);
    if (error) throw error;
    const rows = (data ?? []) as { product_id: string }[];
    rows.forEach((r) => ids.add(r.product_id));
    if (rows.length < BATCH) return ids;
  }
}

export const fetchOwnedProductIds = (userId: string) => fetchProductIdsByStatus(userId, "owned");

export async function fetchCollection(userId: string): Promise<CollectionItem[]> {
  const items: CollectionItem[] = [];
  for (let from = 0; ; from += BATCH) {
    const { data, error } = await supabase
      .from("user_collection").select(ITEM_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }).order("id")
      .range(from, from + BATCH - 1);
    if (error) throw error;
    const rows = (data ?? []) as CollectionItem[];
    items.push(...rows);
    if (rows.length < BATCH) return items;
  }
}

export async function fetchCollectionCounts(): Promise<CollectionCounts> {
  const { data, error } = await supabase.rpc("my_collection_counts");
  if (error) throw error;
  const row = (data as CollectionCounts[] | null)?.[0];
  return row ?? { catalog_total: 0, owned_distinct: 0, owned_quantity: 0, wishlist_total: 0 };
}

export async function fetchSetCompletion(): Promise<SetCompletion[]> {
  const { data, error } = await supabase.rpc("my_set_completion");
  if (error) throw error;
  return (data ?? []) as SetCompletion[];
}

export async function addOwned(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("user_collection")
    .upsert({ user_id: userId, product_id: productId, status: "owned" }, { onConflict: "user_id,product_id,status", ignoreDuplicates: true });
  if (error) throw error;
  // Owning an item clears it from the wishlist.
  const cleanup = await supabase.from("user_collection").delete().eq("user_id", userId).eq("product_id", productId).eq("status", "wishlist");
  if (cleanup.error) throw cleanup.error;
}

export async function removeOwned(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("user_collection").delete()
    .eq("user_id", userId).eq("product_id", productId).eq("status", "owned");
  if (error) throw error;
}

export async function addWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("user_collection")
    .upsert({ user_id: userId, product_id: productId, status: "wishlist" }, { onConflict: "user_id,product_id,status", ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("user_collection").delete()
    .eq("user_id", userId).eq("product_id", productId).eq("status", "wishlist");
  if (error) throw error;
}

export async function updateCollectionItem(userId: string, id: string, patch: Partial<ItemPatch>): Promise<CollectionItem> {
  const { data, error } = await supabase
    .from("user_collection").update(patch)
    .eq("id", id).eq("user_id", userId)
    .select(ITEM_COLUMNS).single();
  if (error) throw error;
  return data as CollectionItem;
}

export async function removeCollectionItem(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("user_collection").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

/** Turns a wishlist row into an owned row, keeping its notes and tags. */
export async function moveToOwned(userId: string, item: CollectionItem): Promise<void> {
  const { error } = await supabase.from("user_collection").update({ status: "owned" }).eq("id", item.id).eq("user_id", userId);
  if (!error) return;
  if (error.code === "23505") { await removeCollectionItem(userId, item.id); return; } // already owned: drop the wishlist duplicate
  throw error;
}
