import { describe, expect, it } from "vitest";
import { byCurrency, convert, summarize, toRateMap, valueBy } from "./money";
import type { FinancialRow } from "./types";

const rates = { EUR: 1, PLN: 4, USD: 2 };

function row(over: Partial<FinancialRow> = {}): FinancialRow {
  return {
    platform: "PS5", category_id: null, currency: "EUR", item_count: 1,
    purchase_total: 0, value_total: 0, matched_cost: 0, matched_value: 0, unpriced_count: 0, ...over,
  };
}

describe("toRateMap", () => {
  it("always treats EUR as 1", () => {
    expect(toRateMap([]).EUR).toBe(1);
    expect(toRateMap([{ currency: "EUR", rate_per_eur: 3, updated_at: "" }]).EUR).toBe(1);
  });
  it("reads other currencies from rows", () => expect(toRateMap([{ currency: "PLN", rate_per_eur: 4.3, updated_at: "" }]).PLN).toBe(4.3));
});

describe("convert", () => {
  it("returns the same amount for the same currency, even without rates", () => expect(convert(10, "GBP", "GBP", {})).toBe(10));
  it("converts through EUR", () => {
    expect(convert(8, "PLN", "EUR", rates)).toBe(2);
    expect(convert(2, "EUR", "PLN", rates)).toBe(8);
    expect(convert(8, "PLN", "USD", rates)).toBe(4);
  });
  it("returns null when a rate is missing", () => {
    expect(convert(10, "GBP", "EUR", rates)).toBeNull();
    expect(convert(10, "EUR", "GBP", rates)).toBeNull();
  });
});

describe("summarize", () => {
  it("adds converted totals across currencies", () => {
    const rows = [
      row({ currency: "EUR", purchase_total: 10, value_total: 30, matched_cost: 10, matched_value: 30 }),
      row({ currency: "PLN", purchase_total: 40, value_total: 80, matched_cost: 40, matched_value: 80 }),
    ];
    const { totals, unconverted } = summarize(rows, "EUR", rates);
    expect(totals.purchase).toBe(20);
    expect(totals.value).toBe(50);
    expect(totals.matchedValue - totals.matchedCost).toBe(30);
    expect(unconverted).toEqual([]);
  });
  it("skips rows it cannot convert and reports their currency", () => {
    const rows = [row({ currency: "EUR", value_total: 10 }), row({ currency: "GBP", value_total: 99 })];
    const result = summarize(rows, "EUR", rates);
    expect(result.totals.value).toBe(10);
    expect(result.unconverted).toEqual(["GBP"]);
  });
  it("does not warn about currencies whose amounts are all zero", () => {
    expect(summarize([row({ currency: "GBP" })], "EUR", rates).unconverted).toEqual([]);
  });
  it("sums items without a value", () => expect(summarize([row({ unpriced_count: 2 }), row({ unpriced_count: 3 })], "EUR", rates).unpriced).toBe(5));
});

describe("valueBy", () => {
  it("groups converted values by key and ignores zero values", () => {
    const rows = [
      row({ platform: "PS5", value_total: 10 }),
      row({ platform: "PS5", currency: "PLN", value_total: 8 }),
      row({ platform: "Switch", value_total: 0 }),
    ];
    expect([...valueBy(rows, (r) => r.platform, "EUR", rates)]).toEqual([["PS5", 12]]);
  });
});

describe("byCurrency", () => {
  it("totals each currency separately, sorted by code, with profit on matched items only", () => {
    const rows = [
      row({ currency: "USD", item_count: 2, purchase_total: 10, value_total: 40, matched_cost: 10, matched_value: 15 }),
      row({ currency: "EUR", item_count: 1, purchase_total: 5, value_total: 5, matched_cost: 5, matched_value: 5 }),
      row({ currency: "USD", item_count: 1, purchase_total: 0, value_total: 20, matched_cost: 0, matched_value: 0 }),
    ];
    const result = byCurrency(rows);
    expect(result.map(([c]) => c)).toEqual(["EUR", "USD"]);
    expect(result[1]?.[1]).toEqual({ items: 3, purchase: 10, value: 60, profit: 5 });
  });
});
