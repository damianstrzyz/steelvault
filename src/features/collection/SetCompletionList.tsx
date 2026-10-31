import { useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useSetCompletion } from "./queries";

const COLLAPSED = 6;

export function SetCompletionList({ onSelectSet }: { onSelectSet: (setId: string) => void }) {
  const sets = useSetCompletion();
  const [all, setAll] = useState(false);
  const rows = (sets.data ?? [])
    .filter((s) => s.total_products > 0)
    .sort((a, b) => b.owned_products / b.total_products - a.owned_products / a.total_products || a.set_name.localeCompare(b.set_name));
  if (rows.length === 0) return null;
  const shown = all ? rows : rows.slice(0, COLLAPSED);

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Set completion</h2>
        {rows.length > COLLAPSED && (
          <button type="button" onClick={() => setAll((v) => !v)} className="text-sm text-accent hover:underline">{all ? "Show fewer" : `Show all ${rows.length}`}</button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => (
          <button key={s.set_id} type="button" onClick={() => onSelectSet(s.set_id)} className="rounded-xl border border-line bg-surface p-4 text-left hover:border-accent">
            <div className="mb-2 flex justify-between gap-2 text-sm"><span className="truncate font-medium">{s.set_name}</span><span className="shrink-0 text-muted">{s.owned_products}/{s.total_products}</span></div>
            <ProgressBar value={(s.owned_products / s.total_products) * 100} label={undefined} />
          </button>
        ))}
      </div>
    </section>
  );
}
