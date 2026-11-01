import type { Currency } from "@/lib/currency";
import type { ExchangeRate, FinancialRow } from "./types";

export type RateMap = Partial<Record<Currency, number>>;

export function toRateMap(rows: ExchangeRate[]): RateMap {
  const map: RateMap = {};
  for (const r of rows) map[r.currency] = r.rate_per_eur;
  map.EUR = 1;
  return map;
}

/** Converts via EUR. Returns null when a needed rate is missing. */
export function convert(amount: number, from: Currency, to: Currency, rates: RateMap): number | null {
  if (from === to) return amount;
  const rf = rates[from];
  const rt = rates[to];
  if (!rf || !rt) return null;
  return (amount / rf) * rt;
}

export interface Totals { purchase: number; value: number; matchedCost: number; matchedValue: number }

function convertRow(row: FinancialRow, to: Currency, rates: RateMap): Totals | null {
  const parts = [row.purchase_total, row.value_total, row.matched_cost, row.matched_value];
  if (parts.every((p) => p === 0)) return { purchase: 0, value: 0, matchedCost: 0, matchedValue: 0 };
  const [purchase, value, matchedCost, matchedValue] = parts.map((p) => convert(p, row.currency, to, rates));
  if (purchase === null || value === null || matchedCost === null || matchedValue === null ||
      purchase === undefined || value === undefined || matchedCost === undefined || matchedValue === undefined) return null;
  return { purchase, value, matchedCost, matchedValue };
}

export function summarize(rows: FinancialRow[], to: Currency, rates: RateMap) {
  const totals: Totals = { purchase: 0, value: 0, matchedCost: 0, matchedValue: 0 };
  const unconverted = new Set<Currency>();
  let unpriced = 0;
  for (const row of rows) {
    unpriced += row.unpriced_count;
    const t = convertRow(row, to, rates);
    if (!t) { unconverted.add(row.currency); continue; }
    totals.purchase += t.purchase;
    totals.value += t.value;
    totals.matchedCost += t.matchedCost;
    totals.matchedValue += t.matchedValue;
  }
  return { totals, unconverted: [...unconverted], unpriced };
}

/** Converted current value grouped by a key (platform, category, ...). */
export function valueBy(rows: FinancialRow[], key: (r: FinancialRow) => string, to: Currency, rates: RateMap): Map<string, number> {
  const out = new Map<string, number>();
  for (const row of rows) {
    const t = convertRow(row, to, rates);
    if (!t || t.value === 0) continue;
    const k = key(row);
    out.set(k, (out.get(k) ?? 0) + t.value);
  }
  return out;
}

/** Totals in each original currency, no conversion. */
export function byCurrency(rows: FinancialRow[]) {
  const map = new Map<Currency, { items: number; purchase: number; value: number; profit: number }>();
  for (const r of rows) {
    const cur = map.get(r.currency) ?? { items: 0, purchase: 0, value: 0, profit: 0 };
    cur.items += r.item_count;
    cur.purchase += r.purchase_total;
    cur.value += r.value_total;
    cur.profit += r.matched_value - r.matched_cost;
    map.set(r.currency, cur);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}
