export interface BarRow { key: string; label: string; value: number; display: string }

export function BarList({ rows, emptyText }: { rows: BarRow[]; emptyText: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted">{emptyText}</p>;
  const max = Math.max(...rows.map((r) => r.value), 0);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate">{r.label}</span><span className="shrink-0 text-muted">{r.display}</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: max > 0 ? `${(r.value / max) * 100}%` : "0%" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
