export type PlaybackSnapshot = {
  currentTime: number;
  duration: number;
  playing: boolean;
};

type AudioState = Pick<HTMLAudioElement, "currentTime" | "duration" | "paused" | "ended">;
type LifecycleTarget = Pick<EventTarget, "addEventListener" | "removeEventListener">;
type VisibilityTarget = LifecycleTarget & { visibilityState: DocumentVisibilityState };

export function syncPlaybackLifecycle(
  audio: AudioState,
  documentTarget: VisibilityTarget,
  windowTarget: LifecycleTarget,
  onSnapshot: (snapshot: PlaybackSnapshot) => void,
) {
  const sync = () => {
    onSnapshot({
      currentTime: audio.currentTime,
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      playing: !audio.paused && !audio.ended,
    });
  };

  documentTarget.addEventListener("visibilitychange", sync);
  windowTarget.addEventListener("pagehide", sync);
  windowTarget.addEventListener("pageshow", sync);

  return () => {
    documentTarget.removeEventListener("visibilitychange", sync);
    windowTarget.removeEventListener("pagehide", sync);
    windowTarget.removeEventListener("pageshow", sync);
  };
}
