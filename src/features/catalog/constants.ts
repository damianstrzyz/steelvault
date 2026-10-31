export const PLATFORMS = ["PS5", "PS4", "PS3", "Xbox Series X|S", "Xbox One", "Switch", "PC", "Other"] as const;
export const REGIONS = ["EU", "US", "JP", "UK", "PL", "AU", "Other"] as const;

export const KIND_LABELS: Record<string, string> = {
  game: "Game",
  steelbook: "Steelbook",
  game_with_steelbook: "Game + Steelbook",
  other: "Other",
};

export const SORT_OPTIONS = [
  { key: "name_asc", label: "Name A–Z", column: "name", ascending: true },
  { key: "name_desc", label: "Name Z–A", column: "name", ascending: false },
  { key: "release_desc", label: "Newest releases", column: "release_date", ascending: false },
  { key: "release_asc", label: "Oldest releases", column: "release_date", ascending: true },
  { key: "added_desc", label: "Recently added", column: "created_at", ascending: false },
] as const;

export const COLLECTION_SORT_OPTIONS = [
  { key: "name_asc", label: "Name A–Z" },
  { key: "name_desc", label: "Name Z–A" },
  { key: "release_desc", label: "Newest releases" },
  { key: "release_asc", label: "Oldest releases" },
  { key: "added_desc", label: "Recently added" },
  { key: "value_desc", label: "Value, high to low" },
  { key: "price_desc", label: "Price paid, high to low" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"] | (typeof COLLECTION_SORT_OPTIONS)[number]["key"];
export const DEFAULT_SORT: SortKey = "name_asc";
export const PAGE_SIZE = 24;
