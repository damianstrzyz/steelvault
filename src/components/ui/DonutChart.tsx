interface DonutChartProps { value: number; label: string; caption?: string }

export function DonutChart({ value, label, caption }: DonutChartProps) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 52;
  const circumference = 2 * Math.PI * r;
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 120 120" role="img" aria-label={`${label}: ${Math.round(pct)}%`} className="size-44">
        <circle cx="60" cy="60" r={r} fill="none" className="stroke-surface-2" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={r} fill="none" className="stroke-ok" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(circumference * pct) / 100} ${circumference}`} transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dasharray 0.5s" }}
        />
        <text x="60" y="62" textAnchor="middle" fontSize="24" fontWeight="700" className="fill-fg">{Math.round(pct)}%</text>
        <text x="60" y="80" textAnchor="middle" fontSize="9" className="fill-muted">{label}</text>
      </svg>
      {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}
