import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MobileFiltersDrawer } from "@/components/layout/MobileFiltersDrawer";
import { CatalogFilters } from "./CatalogFilters";
import { useCategories, useSets } from "./queries";
import type { SortKey } from "./constants";
import type { CatalogFilters as Filters } from "./types";

interface FilterBarProps {
  filters: Filters;
  update: (patch: Partial<Filters>) => void;
  clearAll: () => void;
  activeCount: number;
  sortOptions: readonly { key: SortKey; label: string }[];
  showVariants?: boolean;
}

/** Inline filter row on desktop, button + slide-up drawer on mobile. */
export function FilterBar({ filters, update, clearAll, activeCount, sortOptions, showVariants }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const categories = useCategories();
  const sets = useSets();
  const shared = { filters, onChange: update, categories: categories.data ?? [], sets: sets.data ?? [], sortOptions, showVariants };
  return (
    <div className="mb-6">
      <div className="hidden border-y border-line py-4 md:block"><CatalogFilters {...shared} layout="row" /></div>
      <div className="md:hidden">
        <Button variant="secondary" onClick={() => setOpen(true)}><SlidersHorizontal className="size-4" />Filters{activeCount > 0 ? ` (${activeCount})` : ""}</Button>
      </div>
      <MobileFiltersDrawer open={open} onClose={() => setOpen(false)}>
        <CatalogFilters {...shared} layout="stack" />
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={clearAll}>Clear</Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>Show results</Button>
        </div>
      </MobileFiltersDrawer>
    </div>
  );
}
