import { supabase } from "@/lib/supabase";
import type { CollectionShare, SharedFilters, SharedInfo, SharedItem, SharedPage, SharingOptions } from "./types";

export const SHARED_PAGE_SIZE = 48;
const SHARE_ID_RE = /^[a-f0-9]{32}$/;

export function shareUrl(shareId: string): string {
  return `${window.location.origin}/shared/${shareId}`;
}

// ----- owner side -----
export async function fetchOwnSharing(userId: string): Promise<CollectionShare | null> {
  const { data, error } = await supabase.from("collection_shares").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return (data as CollectionShare | null) ?? null;
}

export async function saveSharing(o: SharingOptions): Promise<CollectionShare> {
  const { data, error } = await supabase.rpc("save_collection_sharing", {
    p_enabled: o.enabled, p_show_prices: o.showPrices, p_show_wishlist: o.showWishlist,
  });
  if (error) throw error;
  return data as CollectionShare;
}

export async function regenerateShareId(): Promise<string> {
  const { data, error } = await supabase.rpc("regenerate_share_id");
  if (error) throw error;
  return data as string;
}

// ----- public side (works without signing in) -----
export async function fetchSharedInfo(shareId: string): Promise<SharedInfo | null> {
  if (!SHARE_ID_RE.test(shareId)) return null;
  const { data, error } = await supabase.rpc("get_shared_collection_info", { p_share_id: shareId });
  if (error) throw error;
  return (data as SharedInfo[] | null)?.[0] ?? null;
}

export async function fetchSharedPage(shareId: string, f: SharedFilters, page: number): Promise<SharedPage> {
  const search = f.q.trim().replace(/[%_\\]/g, "").slice(0, 80);
  const { data, error } = await supabase.rpc("get_shared_collection", {
    p_share_id: shareId,
    p_status: f.status,
    p_search: search === "" ? null : search,
    p_platform: f.platform === "" ? null : f.platform,
    p_limit: SHARED_PAGE_SIZE,
    p_offset: page * SHARED_PAGE_SIZE,
  });
  if (error) throw error;
  const items = (data ?? []) as SharedItem[];
  return { items, total: items[0]?.total_count ?? 0, page };
}
