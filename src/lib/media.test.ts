import { beforeEach, describe, expect, it, vi } from "vitest";

const createSignedUrl = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({ createSignedUrl }),
    },
  },
}));

import { getCachedSignedUrl, signedUrl } from "./media";

describe("signed media URL cache", () => {
  beforeEach(() => {
    createSignedUrl.mockReset();
    createSignedUrl.mockImplementation(async (_path: string, _expiresIn: number) => ({
      data: { signedUrl: `https://media.test/${createSignedUrl.mock.calls.length}` },
      error: null,
    }));
  });

  it("reuses a prepared URL, then refreshes it before it can expire", async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      const firstUrl = await signedUrl("previews", "beat/preview.mp3");

      expect(getCachedSignedUrl("previews", "beat/preview.mp3")).toBe(firstUrl);
      expect(await signedUrl("previews", "beat/preview.mp3")).toBe(firstUrl);
      expect(createSignedUrl).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(55 * 60 * 1000);
      expect(getCachedSignedUrl("previews", "beat/preview.mp3")).toBeNull();

      const refreshedUrl = await signedUrl("previews", "beat/preview.mp3");
      expect(refreshedUrl).not.toBe(firstUrl);
      expect(createSignedUrl).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("can force refresh after a playback error", async () => {
    const firstUrl = await signedUrl("previews", "beat/retry.mp3");
    const refreshedUrl = await signedUrl("previews", "beat/retry.mp3", { refresh: true });

    expect(refreshedUrl).not.toBe(firstUrl);
    expect(createSignedUrl).toHaveBeenCalledTimes(2);
  });
});
