import { describe, expect, it, vi } from "vitest";

import {
  listenForAudioEnded,
  shouldAutoAdvanceAfterPlayError,
  syncPlaybackLifecycle,
} from "./player-lifecycle";

class FakeDocument extends EventTarget {
  visibilityState: DocumentVisibilityState = "visible";
}

describe("playback page lifecycle", () => {
  it("handles the ended event independently of visibility and the ended property", () => {
    const documentTarget = new FakeDocument();
    documentTarget.visibilityState = "hidden";
    const audio = Object.assign(new EventTarget(), { ended: false });
    const onEnded = vi.fn();
    const detach = listenForAudioEnded(audio, onEnded);

    documentTarget.dispatchEvent(new Event("visibilitychange"));
    audio.dispatchEvent(new Event("ended"));

    expect(onEnded).toHaveBeenCalledOnce();
    detach();
    audio.dispatchEvent(new Event("ended"));
    expect(onEnded).toHaveBeenCalledOnce();
  });

  it("keeps a blocked autoplay track selected but advances past media failures", () => {
    expect(shouldAutoAdvanceAfterPlayError({ name: "NotAllowedError" })).toBe(false);
    expect(shouldAutoAdvanceAfterPlayError({ name: "NotSupportedError" })).toBe(true);
    expect(shouldAutoAdvanceAfterPlayError(new Error("Network error"))).toBe(true);
  });

  it("keeps audio playing across visibility and page lifecycle events", () => {
    const documentTarget = new FakeDocument();
    const windowTarget = new EventTarget();
    const audio = {
      currentTime: 12,
      duration: 90,
      paused: false,
      ended: false,
      pause: vi.fn(),
    } as unknown as HTMLAudioElement;
    const onSnapshot = vi.fn();
    const detach = syncPlaybackLifecycle(audio, documentTarget, windowTarget, onSnapshot);

    documentTarget.visibilityState = "hidden";
    documentTarget.dispatchEvent(new Event("visibilitychange"));
    windowTarget.dispatchEvent(new Event("pagehide"));
    windowTarget.dispatchEvent(new Event("pageshow"));

    expect(audio.pause).not.toHaveBeenCalled();
    expect(onSnapshot).toHaveBeenCalledTimes(3);
    expect(onSnapshot).toHaveBeenLastCalledWith({
      currentTime: 12,
      duration: 90,
      playing: true,
    });

    detach();
    windowTarget.dispatchEvent(new Event("pageshow"));
    expect(onSnapshot).toHaveBeenCalledTimes(3);
  });

  it("reports the actual paused state and a safe duration after return", () => {
    const documentTarget = new FakeDocument();
    const windowTarget = new EventTarget();
    const audio = {
      currentTime: 7,
      duration: Number.POSITIVE_INFINITY,
      paused: true,
      ended: false,
    } as HTMLAudioElement;
    const onSnapshot = vi.fn();

    syncPlaybackLifecycle(audio, documentTarget, windowTarget, onSnapshot);
    windowTarget.dispatchEvent(new Event("pageshow"));

    expect(onSnapshot).toHaveBeenCalledWith({
      currentTime: 7,
      duration: 0,
      playing: false,
    });
  });
});
