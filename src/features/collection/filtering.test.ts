import { describe, expect, it } from "vitest";
import type { CatalogFilters, ProductListItem } from "@/features/catalog/types";
import { filterItems, sortItems } from "./filtering";
import type { CollectionItem } from "./types";

const noFilters: CatalogFilters = { q: "", platform: "", region: "", category: "", set: "", kind: "", variants: false, sort: "name_asc" };

function product(over: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: "p", slug: "p", name: "Product", kind: "steelbook", edition_name: null, platform: "PS5", region: "EU",
    ean: null, product_code: null, release_date: null, image_path: null, parent_product_id: null,
    set_id: null, category_id: null, sets: null, categories: null, ...over,
  };
}

function item(id: string, p: Partial<ProductListItem> = {}, over: Partial<CollectionItem> = {}): CollectionItem {
  return {
    id, product_id: id, status: "owned", quantity: 1, condition: null, packaging_condition: null, currency: "EUR",
    purchase_price: null, current_value: null, purchase_date: null, tags: [], notes: null,
    created_at: "2026-01-01T00:00:00Z", products: product({ id, name: id, ...p }), ...over,
  };
}

const ids = (list: CollectionItem[]) => list.map((i) => i.id);

describe("filterItems", () => {
  const list = [
    item("alpha", { platform: "PS5", region: "EU", ean: "2000000000011" }, { tags: ["limited"] }),
    item("beta", { platform: "PS4", region: "US", product_code: "CUSA12345", set_id: "s1", category_id: "c1" }),
    item("gamma", { platform: "Switch", region: "JP", edition_name: "Collector" }),
  ];

  it("returns everything when no filter is set", () => expect(filterItems(list, noFilters)).toHaveLength(3));
  it("filters by platform, region, set and category", () => {
    expect(ids(filterItems(list, { ...noFilters, platform: "PS4" }))).toEqual(["beta"]);
    expect(ids(filterItems(list, { ...noFilters, region: "JP" }))).toEqual(["gamma"]);
    expect(ids(filterItems(list, { ...noFilters, set: "s1" }))).toEqual(["beta"]);
    expect(ids(filterItems(list, { ...noFilters, category: "c1" }))).toEqual(["beta"]);
  });
  it("searches name, edition, EAN, product code and tags, ignoring case", () => {
    expect(ids(filterItems(list, { ...noFilters, q: "ALPHA" }))).toEqual(["alpha"]);
    expect(ids(filterItems(list, { ...noFilters, q: "collector" }))).toEqual(["gamma"]);
    expect(ids(filterItems(list, { ...noFilters, q: "2000000000011" }))).toEqual(["alpha"]);
    expect(ids(filterItems(list, { ...noFilters, q: "cusa" }))).toEqual(["beta"]);
    expect(ids(filterItems(list, { ...noFilters, q: "limited" }))).toEqual(["alpha"]);
  });
  it("combines filters", () => expect(filterItems(list, { ...noFilters, platform: "PS5", q: "beta" })).toHaveLength(0));
});

describe("sortItems", () => {
  const list = [
    item("b", { release_date: "2025-05-01" }, { current_value: 50, purchase_price: 20, created_at: "2026-01-02T00:00:00Z" }),
    item("a", { release_date: null }, { current_value: null, purchase_price: null, created_at: "2026-01-03T00:00:00Z" }),
    item("c", { release_date: "2024-01-01" }, { current_value: 80, purchase_price: 90, created_at: "2026-01-01T00:00:00Z" }),
  ];

  it("sorts by name ascending by default", () => expect(ids(sortItems(list, "name_asc"))).toEqual(["a", "b", "c"]));
  it("sorts by name descending", () => expect(ids(sortItems(list, "name_desc"))).toEqual(["c", "b", "a"]));
  it("puts items without a value last when sorting by value", () => expect(ids(sortItems(list, "value_desc"))).toEqual(["c", "b", "a"]));
  it("puts items without a price last when sorting by price paid", () => expect(ids(sortItems(list, "price_desc"))).toEqual(["c", "b", "a"]));
  it("puts missing release dates last in both directions", () => {
    expect(ids(sortItems(list, "release_asc"))).toEqual(["c", "b", "a"]);
    expect(ids(sortItems(list, "release_desc"))).toEqual(["b", "c", "a"]);
  });
  it("sorts by most recently added", () => expect(ids(sortItems(list, "added_desc"))).toEqual(["a", "b", "c"]));
  it("does not change the original array", () => {
    const before = ids(list);
    sortItems(list, "name_desc");
    expect(ids(list)).toEqual(before);
  });
});
