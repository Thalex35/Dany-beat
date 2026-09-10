import { describe, expect, it } from "vitest";

import { safeAuthRedirect, sanitizeCommentInput } from "./validation";

describe("sanitizeCommentInput", () => {
  it("trims whitespace and rejects empty content", () => {
    expect(sanitizeCommentInput("   hello world   ")).toBe("hello world");
    expect(sanitizeCommentInput("\n   \t  ")).toBe(null);
  });

  it("caps length at the product limit", () => {
    const long = "a".repeat(1200);
    expect(sanitizeCommentInput(long)?.length).toBe(1000);
  });
});

describe("safeAuthRedirect", () => {
  it("keeps only same-origin internal paths", () => {
    expect(safeAuthRedirect("/beats/hello")).toBe("/beats/hello");
    expect(safeAuthRedirect("https://evil.example")).toBe("/");
    expect(safeAuthRedirect("//cdn.example")).toBe("/");
  });
});
