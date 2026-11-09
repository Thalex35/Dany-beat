import { describe, expect, it } from "vitest";

import { getNextPublishedBeatsPage, type Beat, type PublishedBeatsPage } from "./beats";

function makePage(count: number, total: number, offset = 0): PublishedBeatsPage {
  const beats: Beat[] = Array.from({ length: count }, (_, index) => {
    const id = `beat-${offset + index}`;
    const beat: Beat = {
      id,
      title: id,
      slug: id,
      description: null,
      genre: null,
      mood: null,
      bpm: null,
      song_key: null,
      price: 0,
      licenses: [],
      tags: [],
      cover_path: null,
      preview_path: null,
      master_path: null,
      media_source: "upload",
      youtube_url: null,
      status: "published",
      featured: false,
      created_at: "2026-01-01T00:00:00Z",
      published_at: "2026-01-01T00:00:00Z",
    };
    return beat;
  });
  return { beats, total };
}

describe("progressive published beat loading", () => {
  it("continues after the first 48 beats until all 80 results are loaded", () => {
    const first = makePage(48, 80);
    const second = makePage(32, 80, 48);

    expect(getNextPublishedBeatsPage(first, [first])).toBe(1);
    expect(getNextPublishedBeatsPage(second, [first, second])).toBeUndefined();
  });

  it("stops when a page is empty even if the count changes during loading", () => {
    const first = makePage(48, 80);
    const empty = makePage(0, 80);

    expect(getNextPublishedBeatsPage(empty, [first, empty])).toBeUndefined();
  });
});
