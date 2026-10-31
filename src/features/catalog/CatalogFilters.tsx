import { useMemo } from "react";
import { Select, type SelectOption } from "@/components/ui/Select";
import { KIND_LABELS, PLATFORMS, REGIONS, type SortKey } from "./constants";
import type { CatalogFilters as Filters, CatalogSet, Category } from "./types";

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  categories: Category[];
  sets: CatalogSet[];
  layout: "row" | "stack";
  sortOptions: readonly { key: SortKey; label: string }[];
  showVariants?: boolean;
}

const all = (label: string): SelectOption => ({ value: "", label });

export function CatalogFilters({ filters, onChange, categories, sets, layout, sortOptions: sortSource, showVariants = true }: Props) {
  const platformOptions = useMemo(() => [all("All"), ...PLATFORMS.map((p) => ({ value: p, label: p }))], []);
  const regionOptions = useMemo(() => [all("All"), ...REGIONS.map((r) => ({ value: r, label: r }))], []);
  const kindOptions = useMemo(() => [all("All"), ...Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label }))], []);
  const categoryOptions = useMemo(() => [all("All"), ...categories.map((c) => ({ value: c.id, label: c.name }))], [categories]);
  const setOptions = useMemo(
    () => [all("All"), ...sets.filter((s) => !filters.category || s.category_id === filters.category).map((s) => ({ value: s.id, label: s.name }))],
    [sets, filters.category],
  );
  const sortOptions = useMemo(() => sortSource.map((o) => ({ value: o.key, label: o.label })), [sortSource]);

  const wrap = layout === "row" ? "flex flex-wrap items-end gap-3" : "grid gap-4";
  return (
    <div className={wrap}>
      <Select label="Platform" value={filters.platform} options={platformOptions} onChange={(e) => onChange({ platform: e.target.value })} />
      <Select label="Region" value={filters.region} options={regionOptions} onChange={(e) => onChange({ region: e.target.value })} />
      <Select label="Type" value={filters.kind} options={kindOptions} onChange={(e) => onChange({ kind: e.target.value })} />
      <Select label="Category" value={filters.category} options={categoryOptions} onChange={(e) => onChange({ category: e.target.value, set: "" })} />
      <Select label="Set" value={filters.set} options={setOptions} onChange={(e) => onChange({ set: e.target.value })} />
      <Select label="Sort by" value={filters.sort} options={sortOptions} onChange={(e) => onChange({ sort: e.target.value as SortKey })} />
      {showVariants && <label className="flex h-11 items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-accent" checked={filters.variants} onChange={(e) => onChange({ variants: e.target.checked })} />
        Show variants
      </label>}
    </div>
  );
}
