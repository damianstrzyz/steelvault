import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BarChart3, TriangleAlert } from "lucide-react";
import { BarList, type BarRow } from "@/components/ui/BarList";
import { DonutChart } from "@/components/ui/DonutChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { useCategories } from "@/features/catalog/queries";
import { useCollectionCounts, useSetCompletion } from "@/features/collection/queries";
import { useProfile } from "@/features/profile/queries";
import { CompletionBars } from "@/features/stats/CompletionBars";
import { byCurrency, summarize, toRateMap, valueBy } from "@/features/stats/money";
import { useCategoryCompletion, useExchangeRates, useFinancialBreakdown, usePlatformCompletion } from "@/features/stats/queries";
import { CURRENCIES, formatMoney, type Currency } from "@/lib/currency";

const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));
const STALE_RATES_MS = 30 * 24 * 60 * 60 * 1000;

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, tone, note }: { label: string; value: string; tone?: "ok" | "danger"; note?: string }) {
  const color = tone === "ok" ? "text-ok" : tone === "danger" ? "text-danger" : "";
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-muted">{label}</div>
      {note && <div className="mt-1 text-xs text-muted">{note}</div>}
    </div>
  );
}

export default function StatsPage() {
  const counts = useCollectionCounts();
  const sets = useSetCompletion();
  const platforms = usePlatformCompletion();
  const categoryDone = useCategoryCompletion();
  const financial = useFinancialBreakdown();
  const rates = useExchangeRates();
  const categories = useCategories();
  const profile = useProfile();
  const [chosen, setChosen] = useState<Currency | null>(null);
  const display: Currency = chosen ?? profile.data?.preferred_currency ?? "EUR";

  const rateMap = useMemo(() => toRateMap(rates.data ?? []), [rates.data]);
  const rows = useMemo(() => financial.data ?? [], [financial.data]);
  const summary = useMemo(() => summarize(rows, display, rateMap), [rows, display, rateMap]);
  const categoryNames = useMemo(() => new Map<string, string>((categories.data ?? []).map((c) => [c.id, c.name] as const)), [categories.data]);

  const platformValue: BarRow[] = useMemo(
    () => [...valueBy(rows, (r) => r.platform, display, rateMap)].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, label: k, value: v, display: formatMoney(v, display) })),
    [rows, display, rateMap],
  );
  const categoryValue: BarRow[] = useMemo(
    () => [...valueBy(rows, (r) => r.category_id ?? "none", display, rateMap)].sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ key: k, label: k === "none" ? "Uncategorized" : categoryNames.get(k) ?? "Unknown", value: v, display: formatMoney(v, display) })),
    [rows, display, rateMap, categoryNames],
  );

  if (counts.isPending || financial.isPending) {
    return (
      <>
        <PageHeader title="Statistics" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="mt-6 h-72" />
      </>
    );
  }
  if (counts.isError || financial.isError) {
    return <ErrorState message="We could not load your statistics." onRetry={() => { void counts.refetch(); void financial.refetch(); }} />;
  }

  const c = counts.data;
  if (c.owned_distinct === 0) {
    return (
      <>
        <PageHeader title="Statistics" />
        <EmptyState icon={BarChart3} title="No statistics yet" description="Add products to your collection and your totals, completion and values will appear here." action={<Link to="/" className={buttonStyles("primary")}>Browse the catalog</Link>} />
      </>
    );
  }

  const missing = Math.max(0, c.catalog_total - c.owned_distinct);
  const completion = c.catalog_total > 0 ? (c.owned_distinct / c.catalog_total) * 100 : 0;
  const { totals } = summary;
  const profit = totals.matchedValue - totals.matchedCost;
  const profitPct = totals.matchedCost > 0 ? (profit / totals.matchedCost) * 100 : null;
  const latestRate = (rates.data ?? []).map((r) => Date.parse(r.updated_at)).reduce((a, b) => Math.max(a, b), 0);
  const ratesStale = latestRate > 0 && Date.now() - latestRate > STALE_RATES_MS;
  const perCurrency = byCurrency(rows);

  return (
    <>
      <PageHeader title="Statistics" description="How your collection is growing and what it is worth." actions={<div className="w-40"><Select label="Display currency" value={display} options={currencyOptions} onChange={(e) => setChosen(e.target.value as Currency)} /></div>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Products in catalog" value={c.catalog_total.toLocaleString()} />
        <Stat label="Owned products" value={c.owned_distinct.toLocaleString()} note={`${c.owned_quantity.toLocaleString()} copies in total`} />
        <Stat label="Missing products" value={missing.toLocaleString()} />
        <Stat label="Completion" value={`${completion.toFixed(1)}%`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
        <Panel title="Collection progress">
          <DonutChart value={completion} label="complete" caption={`${c.owned_distinct.toLocaleString()} of ${c.catalog_total.toLocaleString()} products`} />
        </Panel>
        <Panel title="Completion by platform">
          <CompletionBars rows={(platforms.data ?? []).map((p) => ({ key: p.platform, label: p.platform, owned: p.owned_products, total: p.total_products }))} emptyText="No platform data yet." />
        </Panel>
      </div>

      <h2 className="mb-3 mt-10 text-xl font-bold">Value</h2>
      {summary.unconverted.length > 0 && (
        <p role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>No exchange rate for {summary.unconverted.join(", ")}, so items priced in {summary.unconverted.length > 1 ? "those currencies are" : "that currency is"} left out of the converted figures below. Add rates as described in docs/EXCHANGE_RATES.md. The table at the bottom shows every currency as entered.</span>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Total purchase cost" value={formatMoney(totals.purchase, display)} />
        <Stat label="Estimated current value" value={formatMoney(totals.value, display)} note={summary.unpriced > 0 ? `${summary.unpriced} item${summary.unpriced === 1 ? "" : "s"} without a value` : undefined} />
        <Stat
          label="Estimated profit / loss"
          value={`${profit >= 0 ? "+" : "−"}${formatMoney(Math.abs(profit), display)}`}
          tone={profit > 0 ? "ok" : profit < 0 ? "danger" : undefined}
          note={profitPct === null ? "Needs items with a price and a value" : `${profitPct >= 0 ? "+" : "−"}${Math.abs(profitPct).toFixed(1)}% on items with both`}
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        Profit counts only items that have both a purchase price and a current value.
        {latestRate > 0 && ` Exchange rates updated ${new Date(latestRate).toLocaleDateString()}.`}
        {ratesStale && " These rates are over 30 days old."}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Value by platform"><BarList rows={platformValue} emptyText="Add current values to your items to see this." /></Panel>
        <Panel title="Value by category"><BarList rows={categoryValue} emptyText="Add current values to your items to see this." /></Panel>
      </div>

      <h2 className="mb-3 mt-10 text-xl font-bold">Completion</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="By category">
          <CompletionBars rows={(categoryDone.data ?? []).map((r) => ({ key: r.category_id, label: r.category_name, owned: r.owned_products, total: r.total_products }))} emptyText="No categories in the catalog yet." />
        </Panel>
        <Panel title="By set">
          <CompletionBars rows={(sets.data ?? []).map((r) => ({ key: r.set_id, label: r.set_name, owned: r.owned_products, total: r.total_products }))} emptyText="No sets in the catalog yet." />
        </Panel>
      </div>

      <h2 className="mb-3 mt-10 text-xl font-bold">Totals by currency</h2>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-left text-muted"><tr><th className="p-3 font-medium">Currency</th><th className="p-3 font-medium">Copies</th><th className="p-3 font-medium">Purchase cost</th><th className="p-3 font-medium">Current value</th><th className="p-3 font-medium">Profit / loss</th></tr></thead>
          <tbody>
            {perCurrency.map(([cur, t]) => (
              <tr key={cur} className="border-t border-line">
                <td className="p-3 font-medium">{cur}</td>
                <td className="p-3">{t.items.toLocaleString()}</td>
                <td className="p-3">{formatMoney(t.purchase, cur)}</td>
                <td className="p-3">{formatMoney(t.value, cur)}</td>
                <td className={`p-3 ${t.profit > 0 ? "text-ok" : t.profit < 0 ? "text-danger" : ""}`}>{formatMoney(t.profit, cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
