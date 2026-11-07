import { describe, expect, it } from "vitest";

import { getYoutubeVideoId, youtubeEmbedUrl, youtubeThumbnailUrl } from "./youtube";

describe("YouTube URL helpers", () => {
  it("parses watch, short, and Shorts URLs", () => {
    expect(getYoutubeVideoId("https://www.youtube.com/watch?v=abcdefghijk&t=10")).toBe(
      "abcdefghijk",
    );
    expect(getYoutubeVideoId("https://youtu.be/abcdefghijk")).toBe("abcdefghijk");
    expect(getYoutubeVideoId("https://youtube.com/shorts/abcdefghijk")).toBe("abcdefghijk");
  });

  it("rejects invalid IDs and non-YouTube hosts", () => {
    expect(getYoutubeVideoId("https://youtube.com/watch?v=short")).toBeNull();
    expect(getYoutubeVideoId("https://youtube.com.evil.example/watch?v=abcdefghijk")).toBeNull();
    expect(getYoutubeVideoId("not a URL")).toBeNull();
  });

  it("builds thumbnail and privacy-enhanced embed URLs", () => {
    const videoUrl = "https://youtu.be/abcdefghijk";
    expect(youtubeThumbnailUrl(videoUrl)).toBe("https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg");
    expect(youtubeEmbedUrl(videoUrl)).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk?playsinline=1&rel=0&controls=1",
    );
    const apiEmbedUrl = youtubeEmbedUrl(videoUrl, {
      enableApi: true,
      origin: "https://dany-beat.vercel.app",
    });
    expect(apiEmbedUrl).toContain(
      "?playsinline=1&rel=0&controls=1&enablejsapi=1&origin=https%3A%2F%2Fdany-beat.vercel.app",
    );
    expect(apiEmbedUrl).not.toContain("autoplay=1");
  });
});
