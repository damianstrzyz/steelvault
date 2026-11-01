import { describe, expect, it } from "vitest";
import { redirectFromState, validateConfirm, validateEmail, validatePassword } from "./validation";

describe("validateEmail", () => {
  it("accepts a normal address", () => expect(validateEmail("a@b.co")).toBeNull());
  it("trims before checking", () => expect(validateEmail("  a@b.co  ")).toBeNull());
  it("rejects empty and malformed input", () => {
    expect(validateEmail("")).toBe("Enter your email address.");
    expect(validateEmail("nope")).toBe("Enter a valid email address.");
    expect(validateEmail("a@b")).toBe("Enter a valid email address.");
    expect(validateEmail("a b@c.de")).toBe("Enter a valid email address.");
  });
});

describe("validatePassword", () => {
  it("requires a value", () => expect(validatePassword("")).toBe("Enter a password."));
  it("requires 8 characters", () => {
    expect(validatePassword("1234567")).toBe("Use at least 8 characters.");
    expect(validatePassword("12345678")).toBeNull();
  });
});

describe("validateConfirm", () => {
  it("matches equal passwords", () => expect(validateConfirm("abc12345", "abc12345")).toBeNull());
  it("reports a mismatch", () => expect(validateConfirm("abc12345", "abc12346")).toBe("Passwords do not match."));
});

describe("redirectFromState", () => {
  it("allows in-app paths with query strings", () => expect(redirectFromState({ from: "/collection?tab=owned" })).toBe("/collection?tab=owned"));
  it("blocks absolute and protocol-relative URLs", () => {
    expect(redirectFromState({ from: "https://evil.example" })).toBe("/");
    expect(redirectFromState({ from: "//evil.example" })).toBe("/");
  });
  it("falls back to the home page for anything else", () => {
    expect(redirectFromState(null)).toBe("/");
    expect(redirectFromState(undefined)).toBe("/");
    expect(redirectFromState({ from: 5 })).toBe("/");
    expect(redirectFromState("/x")).toBe("/");
  });
});
