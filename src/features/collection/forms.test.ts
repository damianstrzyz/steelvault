import { describe, expect, it } from "vitest";
import { parseMoney, parseQuantity, parseTags } from "./forms";

describe("parseMoney", () => {
  it("treats empty input as no value", () => expect(parseMoney("  ").value).toBeNull());
  it("accepts a comma or a dot as the decimal separator", () => {
    expect(parseMoney("12,50").value).toBe(12.5);
    expect(parseMoney("12.5").value).toBe(12.5);
  });
  it("rounds to two decimals", () => expect(parseMoney("19.999").value).toBe(20));
  it("accepts zero", () => expect(parseMoney("0").value).toBe(0));
  it("rejects negatives and text", () => {
    expect(parseMoney("-1").error).toBe("Enter an amount of 0 or more.");
    expect(parseMoney("abc").error).toBe("Enter an amount of 0 or more.");
  });
  it("rejects absurdly large amounts", () => expect(parseMoney("99999999999").error).toBe("That amount is too large."));
});

describe("parseTags", () => {
  it("lowercases, trims and removes duplicates", () => expect(parseTags(" Limited, SIGNED,limited ,, ").value).toEqual(["limited", "signed"]));
  it("returns an empty list for empty input", () => expect(parseTags("").value).toEqual([]));
  it("rejects tags longer than 30 characters", () => expect(parseTags("x".repeat(31)).error).toBe("Each tag can be up to 30 characters."));
  it("rejects more than 20 tags", () => {
    const many = Array.from({ length: 21 }, (_, i) => `t${i}`).join(",");
    expect(parseTags(many).error).toBe("Use at most 20 tags.");
  });
});

describe("parseQuantity", () => {
  it("accepts whole numbers from 1 to 999", () => {
    expect(parseQuantity("1").value).toBe(1);
    expect(parseQuantity("999").value).toBe(999);
  });
  it("rejects zero, fractions, text and numbers over 999", () => {
    for (const bad of ["0", "2.5", "abc", "1000", "", "-3"]) expect(parseQuantity(bad).error).toBe("Enter a whole number from 1 to 999.");
  });
});
