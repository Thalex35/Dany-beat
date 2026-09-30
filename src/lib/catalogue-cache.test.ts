import { describe, expect, it } from "vitest";

import { isPersistableCatalogueKey } from "./catalogue-cache";

describe("isPersistableCatalogueKey", () => {
  it("allows public catalogue queries and the revision check", () => {
    expect(
      isPersistableCatalogueKey([
        "beats",
        "published",
        {
          page: 0,
          pageSize: 24,
          search: "",
          genre: "all",
          mood: "all",
          songKey: "all",
          bpmMin: null,
          bpmMax: null,
          priceMax: null,
          sort: "newest",
        },
      ]),
    ).toBe(true);
    expect(isPersistableCatalogueKey(["beat-filter-options"])).toBe(true);
    expect(isPersistableCatalogueKey(["public-catalogue-revision"])).toBe(true);
  });

  it("excludes personalized catalogue views, details, and private queries", () => {
    expect(isPersistableCatalogueKey(["beats", "published", { page: 1 }])).toBe(false);
    expect(isPersistableCatalogueKey(["beat", "quiet-storm"])).toBe(false);
    expect(isPersistableCatalogueKey(["cart-beats", "user-id"])).toBe(false);
    expect(isPersistableCatalogueKey(["me"])).toBe(false);
    expect(isPersistableCatalogueKey(["admin-beats"])).toBe(false);
    expect(isPersistableCatalogueKey(["beat-stats", "all"])).toBe(false);
  });
});