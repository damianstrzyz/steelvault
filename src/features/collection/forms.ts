export function parseMoney(raw: string): { value: number | null; error?: string } {
  const text = raw.trim().replace(",", ".");
  if (text === "") return { value: null };
  const n = Number(text);
  if (!Number.isFinite(n) || n < 0) return { value: null, error: "Enter an amount of 0 or more." };
  if (n > 9_999_999_999) return { value: null, error: "That amount is too large." };
  return { value: Math.round(n * 100) / 100 };
}

export function parseTags(raw: string): { value: string[]; error?: string } {
  const tags = [...new Set(raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (tags.some((t) => t.length > 30)) return { value: [], error: "Each tag can be up to 30 characters." };
  if (tags.length > 20) return { value: [], error: "Use at most 20 tags." };
  return { value: tags };
}

export function parseQuantity(raw: string): { value: number; error?: string } {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 999) return { value: 1, error: "Enter a whole number from 1 to 999." };
  return { value: n };
}
