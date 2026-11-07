import { describe, expect, it } from "vitest";

import { playerTrackFromBeat } from "./player";

const baseBeat = {
  id: "beat-1",
  title: "FLOU",
  slug: "flou",
  bpm: 100,
  cover_path: null,
  preview_path: null as string | null,
  media_source: "youtube" as const,
  youtube_url: "https://youtu.be/Zv5xDtciXoo",
};

describe("playerTrackFromBeat", () => {
  it("plays an uploaded preview when a YouTube beat has one", () => {
    const track = playerTrackFromBeat({ ...baseBeat, preview_path: "flou/preview.mp3" });

    expect(track.mediaSource).toBe("upload");
    expect(track.previewPath).toBe("flou/preview.mp3");
    expect(track.youtubeUrl).toBe(baseBeat.youtube_url);
  });

  it("keeps YouTube playback when no preview file is available", () => {
    const track = playerTrackFromBeat(baseBeat);

    expect(track.mediaSource).toBe("youtube");
    expect(track.previewPath).toBeNull();
    expect(track.youtubeUrl).toBe(baseBeat.youtube_url);
  });
});
