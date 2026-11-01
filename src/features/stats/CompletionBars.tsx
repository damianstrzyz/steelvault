import { useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";

export interface CompletionRow { key: string; label: string; owned: number; total: number }

export function CompletionBars({ rows, limit = 6, emptyText }: { rows: CompletionRow[]; limit?: number; emptyText: string }) {
  const [all, setAll] = useState(false);
  const sorted = rows
    .filter((r) => r.total > 0)
    .sort((a, b) => b.owned / b.total - a.owned / a.total || b.total - a.total || a.label.localeCompare(b.label));
  if (sorted.length === 0) return <p className="text-sm text-muted">{emptyText}</p>;
  const shown = all ? sorted : sorted.slice(0, limit);
  return (
    <div>
      <ul className="space-y-4">
        {shown.map((r) => (
          <li key={r.key}>
            <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate">{r.label}</span><span className="shrink-0 text-muted">{r.owned}/{r.total}</span></div>
            <ProgressBar value={(r.owned / r.total) * 100} />
          </li>
        ))}
      </ul>
      {sorted.length > limit && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-4 text-sm text-accent hover:underline">{all ? "Show fewer" : `Show all ${sorted.length}`}</button>
      )}
    </div>
  );
}
