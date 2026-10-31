export const CURRENCIES = ["PLN", "EUR", "USD", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}
