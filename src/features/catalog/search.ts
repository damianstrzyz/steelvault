/** Strip characters that have meaning inside PostgREST or() filters and ILIKE patterns. */
export function sanitizeSearch(raw: string): string {
  return raw.trim().replace(/[%_,()*\\"]/g, "").slice(0, 80);
}
