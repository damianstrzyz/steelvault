import { supabase } from "@/lib/supabase";
import { PAGE_SIZE, SORT_OPTIONS } from "./constants";
import type { CatalogFilters, CatalogPage, CatalogSet, Category, ProductDetail, ProductListItem, RelatedProducts } from "./types";

export const PRODUCT_LIST_COLUMNS =
  "id, slug, name, kind, edition_name, platform, region, ean, product_code, release_date, image_path, parent_product_id, set_id, category_id, sets(name), categories(name)";
const DETAIL_COLUMNS = `${PRODUCT_LIST_COLUMNS}, description, attributes, created_at`;

export type CatalogSource = "catalog" | "missing";

const MISSING_COLUMNS =
  "id, slug, name, kind, edition_name, platform, region, ean, product_code, release_date, image_path, parent_product_id, set_id, category_id, set_name, category_name";

interface MissingRow extends Omit<ProductListItem, "sets" | "categories"> {
  set_name: string | null;
  category_name: string | null;
}

function fromMissingRow(row: MissingRow): ProductListItem {
  const { set_name, category_name, ...rest } = row;
  return { ...rest, sets: set_name ? { name: set_name } : null, categories: category_name ? { name: category_name } : null };
}

/** Strip characters that have meaning inside PostgREST or() filters and ILIKE patterns. */
function sanitizeSearch(raw: string): string {
  return raw.trim().replace(/[%_,()*\\"]/g, "").slice(0, 80);
}

export async function fetchCatalogPage(filters: CatalogFilters, page: number, source: CatalogSource = "catalog"): Promise<CatalogPage> {
  let query = source === "missing"
    ? supabase.from("my_missing_products").select(MISSING_COLUMNS, { count: "exact" })
    : supabase.from("products").select(PRODUCT_LIST_COLUMNS, { count: "exact" });

  if (filters.platform) query = query.eq("platform", filters.platform);
  if (filters.region) query = query.eq("region", filters.region);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.set) query = query.eq("set_id", filters.set);
  if (filters.kind) query = query.eq("kind", filters.kind);

  const term = sanitizeSearch(filters.q);
  if (term) {
    // Searching includes variants so a variant's own EAN or code can always be found.
    const parts = [`name.ilike.%${term}%`, `product_code.ilike.${term}%`];
    if (/^\d{8,14}$/.test(term)) parts.push(`ean.eq.${term}`);
    query = query.or(parts.join(","));
  } else if (!filters.variants) {
    query = query.is("parent_product_id", null);
  }

  const sort = SORT_OPTIONS.find((o) => o.key === filters.sort) ?? SORT_OPTIONS[0];
  query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false }).order("id");

  const from = page * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  const items = source === "missing" ? ((data ?? []) as MissingRow[]).map(fromMissingRow) : ((data ?? []) as ProductListItem[]);
  return { items, total: count ?? 0, page };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("id, slug, name").order("sort_order").order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchSets(): Promise<CatalogSet[]> {
  const { data, error } = await supabase.from("sets").select("id, slug, name, category_id").order("name");
  if (error) throw error;
  return (data ?? []) as CatalogSet[];
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  const { data, error } = await supabase.from("products").select(DETAIL_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as ProductDetail | null) ?? null;
}

export async function fetchRelatedProducts(product: ProductDetail): Promise<RelatedProducts> {
  const baseId = product.parent_product_id ?? product.id;
  const variantsQuery = supabase
    .from("products").select(PRODUCT_LIST_COLUMNS)
    .or(`id.eq.${baseId},parent_product_id.eq.${baseId}`)
    .neq("id", product.id).order("name").limit(12);
  const sameSetQuery = product.set_id
    ? supabase.from("products").select(PRODUCT_LIST_COLUMNS)
        .eq("set_id", product.set_id).neq("id", product.id).is("parent_product_id", null)
        .order("name").limit(10)
    : null;

  const [variantsRes, sameSetRes] = await Promise.all([variantsQuery, sameSetQuery]);
  if (variantsRes.error) throw variantsRes.error;
  if (sameSetRes?.error) throw sameSetRes.error;

  const variants = (variantsRes.data ?? []) as ProductListItem[];
  const seen = new Set(variants.map((v) => v.id));
  const sameSet = ((sameSetRes?.data ?? []) as ProductListItem[]).filter((p) => !seen.has(p.id));
  return { variants, sameSet };
}
