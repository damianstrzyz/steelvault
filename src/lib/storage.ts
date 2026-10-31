import { supabase } from "./supabase";

export function productImageUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
