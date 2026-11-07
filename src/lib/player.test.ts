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
  it("uses YouTube playback for YouTube beats even if an uploaded preview exists", () => {
    const track = playerTrackFromBeat({ ...baseBeat, preview_path: "flou/preview.mp3" });

    expect(track.mediaSource).toBe("youtube");
    expect(track.previewPath).toBe("flou/preview.mp3");
    expect(track.youtubeUrl).toBe(baseBeat.youtube_url);
  });

  it("uses YouTube playback when there is no uploaded preview", () => {
    const track = playerTrackFromBeat(baseBeat);

    expect(track.mediaSource).toBe("youtube");
    expect(track.previewPath).toBeNull();
    expect(track.youtubeUrl).toBe(baseBeat.youtube_url);
  });
});
