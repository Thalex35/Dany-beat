import { describe, expect, it, vi } from "vitest";

import {
  clearMediaSessionPosition,
  registerMediaSessionHandlers,
  setMediaSessionPlaybackState,
  setMediaSessionPosition,
} from "./media-session";

describe("Media Session helpers", () => {
  it("registers supported actions and tolerates unsupported actions", () => {
    const registered = new Map<MediaSessionAction, MediaSessionActionHandler | null>();
    const session = {
      setActionHandler: vi.fn((action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
        if (action === "seekto" && handler) throw new Error("Unsupported action");
        registered.set(action, handler);
      }),
    };
    const handlers: MediaSessionHandlers = {
      play: vi.fn(),
      pause: vi.fn(),
      previoustrack: vi.fn(),
      nexttrack: vi.fn(),
      seekbackward: vi.fn(),
      seekforward: vi.fn(),
      seekto: vi.fn(),
    };

    const cleanup = registerMediaSessionHandlers(session, handlers);

    expect(registered.get("play")).toBe(handlers.play);
    expect(registered.get("seekto")).toBeUndefined();
    expect(() => cleanup()).not.toThrow();
    expect(registered.get("play")).toBeNull();
  });

  it("clamps position updates and ignores invalid durations", () => {
    const setPositionState = vi.fn();
    const session = { setPositionState };

    setMediaSessionPosition(session, 120, 90);
    setMediaSessionPosition(session, Number.NaN, 90);
    setMediaSessionPosition(session, 5, 0);

    expect(setPositionState).toHaveBeenCalledTimes(1);
    expect(setPositionState).toHaveBeenCalledWith({
      duration: 90,
      playbackRate: 1,
      position: 90,
    });
  });

  it("clears position and tolerates unsupported state operations", () => {
    const clearPositionState = vi.fn(() => {
      throw new Error("Unsupported");
    });
    const session = {
      setPositionState: vi.fn(),
      clearPositionState,
      setActionHandler: vi.fn(),
      get playbackState() {
        throw new Error("Unsupported");
      },
      set playbackState(_value: MediaSessionPlaybackState) {
        throw new Error("Unsupported");
      },
    };

    expect(() => clearMediaSessionPosition(session)).not.toThrow();
    expect(() => setMediaSessionPlaybackState(session, "playing")).not.toThrow();
    expect(clearPositionState).toHaveBeenCalledOnce();
  });
});

type MediaSessionHandlers = Parameters<typeof registerMediaSessionHandlers>[1];
