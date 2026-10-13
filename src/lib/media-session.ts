export type MediaSessionHandlers = Partial<
  Record<MediaSessionAction, MediaSessionActionHandler>
>;

const MEDIA_SESSION_ACTIONS: MediaSessionAction[] = [
  "play",
  "pause",
  "previoustrack",
  "nexttrack",
  "seekbackward",
  "seekforward",
  "seekto",
];

export function getMediaSession() {
  try {
    return typeof navigator === "undefined" ? null : navigator.mediaSession ?? null;
  } catch {
    return null;
  }
}

export function registerMediaSessionHandlers(
  session: Pick<MediaSession, "setActionHandler">,
  handlers: MediaSessionHandlers,
) {
  for (const action of MEDIA_SESSION_ACTIONS) {
    const handler = handlers[action];
    if (!handler) continue;
    try {
      session.setActionHandler(action, handler);
    } catch {
      // Individual Media Session actions may not be supported.
    }
  }

  return () => {
    for (const action of MEDIA_SESSION_ACTIONS) {
      if (!handlers[action]) continue;
      try {
        session.setActionHandler(action, null);
      } catch {
        // Unsupported actions do not need cleanup.
      }
    }
  };
}

export function setMediaSessionMetadata(
  session: Pick<MediaSession, "metadata">,
  metadata: MediaMetadata | null,
) {
  try {
    session.metadata = metadata;
  } catch {
    // Some browsers expose Media Session without supporting metadata updates.
  }
}

export function setMediaSessionPlaybackState(
  session: Pick<MediaSession, "playbackState">,
  state: MediaSessionPlaybackState,
) {
  try {
    session.playbackState = state;
  } catch {
    // Some browsers expose Media Session without supporting playback state.
  }
}

export function setMediaSessionPosition(
  session: Pick<MediaSession, "setPositionState">,
  position: number,
  duration: number,
) {
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return;

  try {
    session.setPositionState({
      duration,
      playbackRate: 1,
      position: Math.min(Math.max(position, 0), duration),
    });
  } catch {
    // Position state is optional and can reject unsupported or stale values.
  }
}

export function clearMediaSessionPosition(
  session: Pick<MediaSession, "setPositionState"> & { clearPositionState?: () => void },
) {
  try {
    session.clearPositionState?.();
  } catch {
    // Position state is optional.
  }
}
