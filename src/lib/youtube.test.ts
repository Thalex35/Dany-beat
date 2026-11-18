import { describe, expect, it } from "vitest";

import {
  getYoutubeVideoId,
  youtubeEmbedUrl,
  youtubePlaybackErrorMessage,
  youtubeThumbnailUrl,
} from "./youtube";

describe("YouTube URL helpers", () => {
  it("parses watch, short, embed, Shorts, and YouTube Music URLs", () => {
    expect(getYoutubeVideoId("https://www.youtube.com/watch?v=abcdefghijk&t=10")).toBe(
      "abcdefghijk",
    );
    expect(getYoutubeVideoId("https://youtu.be/abcdefghijk")).toBe("abcdefghijk");
    expect(getYoutubeVideoId("https://www.youtube.com/embed/abcdefghijk")).toBe("abcdefghijk");
    expect(getYoutubeVideoId("https://music.youtube.com/watch?v=abcdefghijk")).toBe(
      "abcdefghijk",
    );
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
      "https://www.youtube-nocookie.com/embed/abcdefghijk?playsinline=1&rel=0",
    );
    expect(youtubeEmbedUrl(videoUrl, { enableApi: true, autoPlay: true })).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk?playsinline=1&rel=0&enablejsapi=1&autoplay=1",
    );
    expect(youtubeEmbedUrl(videoUrl, { enableApi: true, autoPlay: true, controls: false })).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk?playsinline=1&rel=0&enablejsapi=1&autoplay=1&controls=0",
    );
    expect(youtubeEmbedUrl(videoUrl, { enableApi: true, origin: "https://beats.example" })).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk?playsinline=1&rel=0&enablejsapi=1&origin=https%3A%2F%2Fbeats.example",
    );
  });

  it("explains YouTube loader failures and video playback restrictions", () => {
    expect(youtubePlaybackErrorMessage()).toContain("YouTube n'est pas bloqué");
    expect(youtubePlaybackErrorMessage(101)).toContain("bloque sa lecture");
  });
});
