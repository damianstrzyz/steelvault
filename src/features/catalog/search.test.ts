import { describe, expect, it } from "vitest";
import { sanitizeSearch } from "./search";

describe("sanitizeSearch", () => {
  it("trims whitespace", () => expect(sanitizeSearch("  zelda  ")).toBe("zelda"));
  it("removes wildcard and filter-syntax characters", () => {
    expect(sanitizeSearch('a%b_c,d(e)f*g"h')).toBe("abcdefgh");
  });
  it("keeps EANs and product codes intact", () => {
    expect(sanitizeSearch("5012345000011")).toBe("5012345000011");
    expect(sanitizeSearch("PPSA10001")).toBe("PPSA10001");
  });
  it("limits length to 80 characters", () => expect(sanitizeSearch("x".repeat(200))).toHaveLength(80));
  it("returns an empty string for only special characters", () => expect(sanitizeSearch("%%__")).toBe(""));
});
