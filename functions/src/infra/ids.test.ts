import { describe, expect, it } from "vitest";
import { normalizeKey, toDocId } from "./ids.js";

describe("ids", () => {
  it("normalizes key casing and spaces", () => {
    expect(normalizeKey(" Admin@Example.COM ")).toBe("admin@example.com");
  });

  it("encodes slash characters for Firestore document ids", () => {
    expect(toDocId("A/B")).not.toContain("/");
  });
});

