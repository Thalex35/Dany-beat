import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { track } from "@/lib/analytics";
import { getCachedSignedUrl, signedUrl } from "@/lib/media";
import {
  clearMediaSessionPosition,
  getMediaSession,
  registerMediaSessionHandlers,
  setMediaSessionMetadata,
  setMediaSessionPlaybackState,
  setMediaSessionPosition,
} from "@/lib/media-session";
import {
  listenForAudioEnded,
  syncPlaybackLifecycle,
} from "@/lib/player-lifecycle";
import {
  getYoutubeVideoId,
  youtubePlaybackErrorMessage,
  youtubeThumbnailUrl,
} from "@/lib/youtube";

export type PlayerTrack = {
  id: string;
  title: string;
  slug: string;
  bpm: number | null;
  coverPath: string | null;
  previewPath: string | null;
  mediaSource?: "upload" | "youtube";
  youtubeUrl?: string | null;
};

export type YoutubeControls = {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  loadVideo: (videoId: string) => void;
};

export function playerTrackFromBeat(beat: {
  id: string;
  title: string;
  slug: string;
  bpm: number | null;
  cover_path: string | null;
  preview_path: string | null;
  media_source: "upload" | "youtube";
  youtube_url: string | null;
}): PlayerTrack {
  return {
    id: beat.id,
    title: beat.title,
    slug: beat.slug,
    bpm: beat.bpm,
    coverPath: beat.cover_path,
    previewPath: beat.preview_path,
    mediaSource: beat.preview_path ? "upload" : beat.media_source,
    youtubeUrl: beat.youtube_url,
  };
}

export function youtubeFallbackTrack(track: PlayerTrack): PlayerTrack | null {
  if (track.mediaSource === "youtube" || !getYoutubeVideoId(track.youtubeUrl)) return null;
  return { ...track, mediaSource: "youtube" };
}

export function nextTrackInQueue(queue: PlayerTrack[], currentId: string): PlayerTrack | null {
  const index = queue.findIndex((track) => track.id === currentId);
  return index < 0 ? null : (queue[index + 1] ?? null);
}

export function orderFeaturedTracks(
  featuredTracks: PlayerTrack[],
  catalogueTracks: PlayerTrack[],
): PlayerTrack[] {
  const featuredIds = new Set(featuredTracks.map((track) => track.id));
  return [
    ...featuredTracks,
    ...catalogueTracks.filter((track) => !featuredIds.has(track.id)),
  ];
}

type PlayerValue = {
  current: PlayerTrack | null;
  youtubeRetryKey: number;
  playing: boolean;
  finished: boolean;
  loading: boolean;
  error: string | null;
  progress: number;
  duration: number;
  volume: number;
  loop: boolean;
  setQueue: (queue: PlayerTrack[]) => void;
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  toggle: (track?: PlayerTrack) => void;
  setLoop: (value: boolean) => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  registerYoutubeControls: (controls: YoutubeControls | null) => void;
  setYoutubePlaying: (value: boolean) => void;
  setYoutubeProgress: (progress: number, duration: number) => void;
  setYoutubeError: (code?: number) => void;
  finishYoutube: () => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

function waitForAudioMetadata(audio: HTMLAudioElement) {
  if (audio.readyState >= 1) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("error", onError);
    };
    const onLoadedMetadata = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Audio metadata could not be loaded."));
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayerTrack | null>(null);
  const [youtubeRetryKey, setYoutubeRetryKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);
  const [loop, setLoopState] = useState(false);
  const queueRef = useRef<PlayerTrack[]>([]);
  const currentRef = useRef<PlayerTrack | null>(null);
  const youtubeControlsRef = useRef<YoutubeControls | null>(null);
  const loopRef = useRef(false);
  const playRef = useRef<(track: PlayerTrack) => void>(() => undefined);
  const playRequestRef = useRef(0);
  const previewUrlsRef = useRef(new Map<string, { path: string; url: string; expiresAt: number }>());
  const endedRequestRef = useRef<number | null>(null);
  const youtubeEndHandledRef = useRef<string | null>(null);
  const mediaActionsRef = useRef({
    play: () => {},
    pause: () => {},
    next: () => {},
    previous: () => {},
    seek: (_seconds: number) => {},
  });
  const playingRef = useRef(playing);
  const progressRef = useRef(progress);
  const durationRef = useRef(duration);
  const volumeRef = useRef(volume);
  playingRef.current = playing;
  progressRef.current = progress;
  durationRef.current = duration;
  volumeRef.current = volume;

  const fallbackToYoutube = useCallback((track: PlayerTrack) => {
    const fallbackTrack = youtubeFallbackTrack(track);
    if (!fallbackTrack || currentRef.current?.id !== track.id) return false;

    currentRef.current = fallbackTrack;
    queueRef.current = queueRef.current.map((item) =>
      item.id === track.id ? fallbackTrack : item,
    );
    setCurrent(fallbackTrack);
    setError(null);
    setFinished(false);
    setProgress(0);
    setDuration(0);
    setYoutubeRetryKey((key) => key + 1);
    setLoading(true);
    setPlaying(true);

    const audio = audioRef.current;
    audio?.pause();
    audio?.removeAttribute("src");
    audio?.load();
    youtubeControlsRef.current?.pause();
    youtubeControlsRef.current = null;
    return true;
  }, []);

  const setQueue = useCallback((queue: PlayerTrack[]) => {
    const currentTrack = currentRef.current;
    queueRef.current = queue.map((track) =>
      track.id === currentTrack?.id ? currentTrack : track,
    );
    if (currentTrack && !queueRef.current.some((track) => track.id === currentTrack.id)) {
      queueRef.current.push(currentTrack);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.9;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      const endedTrack = currentRef.current;
      if (!endedTrack || endedTrack.mediaSource === "youtube") return;
      const request = playRequestRef.current;
      if (endedRequestRef.current === request) return;
      endedRequestRef.current = request;
      if (loopRef.current) {
        const loopRequest = ++playRequestRef.current;
        audio.currentTime = 0;
        endedRequestRef.current = loopRequest - 1;
        void audio.play().catch(() => {
          if (loopRequest === playRequestRef.current) {
            setError("Le navigateur a interrompu la lecture. Appuyez sur Lire pour reprendre.");
            setPlaying(false);
          }
        });
        return;
      }
      const nextTrack = nextTrackInQueue(queueRef.current, endedTrack.id);
      if (nextTrack) {
        playRef.current(nextTrack);
        return;
      }
      setPlaying(false);
      setFinished(true);
    };
    const onPlay = () => {
      const session = getMediaSession();
      if (session) setMediaSessionPlaybackState(session, "playing");
      setPlaying(true);
      setFinished(false);
    };
    const onPause = () => {
      if (currentRef.current?.mediaSource === "youtube") return;
      const session = getMediaSession();
      if (session) setMediaSessionPlaybackState(session, "paused");
      setPlaying(false);
    };
    const onErr = () => {
      const failedTrack = currentRef.current;
      if (failedTrack?.mediaSource === "youtube") return;
      if (failedTrack && fallbackToYoutube(failedTrack)) return;
      setError("Cet extrait n'a pas pu être chargé.");
      setPlaying(false);
      setLoading(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onErr);
    const detachEnded = listenForAudioEnded(audio, onEnd);
    const detachLifecycle = syncPlaybackLifecycle(audio, document, window, (snapshot) => {
      if (currentRef.current?.mediaSource === "youtube") return;
      setProgress(snapshot.currentTime);
      setDuration(snapshot.duration);
      setPlaying(snapshot.playing);
    });
    return () => {
      detachLifecycle();
      detachEnded();
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onErr);
    };
  }, [fallbackToYoutube]);

  const registerYoutubeControls = useCallback((controls: YoutubeControls | null) => {
    youtubeControlsRef.current = controls;
    if (!controls) return;
    controls.setVolume(volumeRef.current);
    setLoading(false);
    if (playingRef.current) controls.play();
    else controls.pause();
  }, []);

  const setYoutubePlaying = useCallback((value: boolean) => {
    setPlaying(value);
    setLoading(false);
    if (value) youtubeEndHandledRef.current = null;
    if (value && currentRef.current) {
      void track("beat_play", { beatId: currentRef.current.id, once: true });
    }
  }, []);

  const setYoutubeProgress = useCallback((nextProgress: number, nextDuration: number) => {
    setProgress(nextProgress);
    setDuration(nextDuration);
  }, []);

  const setYoutubeError = useCallback((code?: number) => {
    setError(youtubePlaybackErrorMessage(code));
    setPlaying(false);
    setLoading(false);
  }, []);

  const finishYoutube = useCallback(() => {
    const currentTrack = currentRef.current;
    if (!currentTrack || currentTrack.mediaSource !== "youtube") return;
    if (youtubeEndHandledRef.current === currentTrack.id) return;
    youtubeEndHandledRef.current = currentTrack.id;
    if (loopRef.current) {
      youtubeControlsRef.current?.seek(0);
      youtubeControlsRef.current?.play();
      setProgress(0);
      setPlaying(true);
      return;
    }
    const nextTrack = nextTrackInQueue(queueRef.current, currentTrack.id);
    if (nextTrack) {
      playRef.current(nextTrack);
      return;
    }
    setPlaying(false);
    setFinished(true);
  }, []);

  const play = useCallback(
    async (next: PlayerTrack, queue?: PlayerTrack[]) => {
      const audio = audioRef.current;
      if (!audio) return;
      const request = ++playRequestRef.current;
      endedRequestRef.current = null;
      youtubeEndHandledRef.current = null;
      if (queue) queueRef.current = queue;
      if (!queueRef.current.some((track) => track.id === next.id)) {
        queueRef.current = queue ? [...queue, next] : [next];
      }
      setError(null);
      setFinished(false);

      if (next.mediaSource === "youtube") {
        if (!next.youtubeUrl || !getYoutubeVideoId(next.youtubeUrl)) {
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
          youtubeControlsRef.current?.pause();
          youtubeControlsRef.current = null;
          setCurrent(next);
          currentRef.current = next;
          setProgress(0);
          setDuration(0);
          setError("Aucune URL YouTube disponible pour ce beat.");
          setPlaying(false);
          setLoading(false);
          return;
        }
        if (current?.id === next.id && current.mediaSource === "youtube") {
          if (error) setYoutubeRetryKey((key) => key + 1);
          if (finished) {
            youtubeControlsRef.current?.seek(0);
            setProgress(0);
          }
          youtubeControlsRef.current?.play();
          setPlaying(true);
          setLoading(Boolean(error) || !youtubeControlsRef.current);
          return;
        }
        if (current?.mediaSource === "youtube") {
          if (error && !youtubeControlsRef.current) {
            setYoutubeRetryKey((key) => key + 1);
          }
          const videoId = getYoutubeVideoId(next.youtubeUrl);
          if (videoId) youtubeControlsRef.current?.loadVideo(videoId);
          setCurrent(next);
          currentRef.current = next;
          youtubeEndHandledRef.current = next.id;
          setProgress(0);
          setDuration(0);
          setLoading(true);
          setPlaying(true);
          return;
        }
        audio.pause();
        setPlaying(false);
        audio.removeAttribute("src");
        audio.load();
        youtubeControlsRef.current?.pause();
        youtubeControlsRef.current = null;
        setCurrent(next);
        currentRef.current = next;
        setProgress(0);
        setDuration(0);
        setLoading(true);
        setPlaying(true);
        return;
      }

      youtubeControlsRef.current?.pause();
      youtubeControlsRef.current = null;
      const cachedPreview = previewUrlsRef.current.get(next.id);
      const refreshUrl = Boolean(audio.error);
      const cachedUrl =
        !refreshUrl &&
        cachedPreview?.path === next.previewPath &&
        cachedPreview.expiresAt > Date.now()
          ? cachedPreview.url
          : null;
      const sharedCachedUrl = refreshUrl ? null : getCachedSignedUrl("previews", next.previewPath);
      if (current?.id === next.id && audio.src && (cachedUrl || sharedCachedUrl) && !audio.error) {
        if (audio.ended) audio.currentTime = 0;
        try {
          await audio.play();
          setPlaying(true);
        } catch (playError) {
          if (request === playRequestRef.current) {
            setError("Le navigateur a bloqué la lecture. Appuyez sur Lire pour réessayer.");
            setPlaying(false);
          }
        }
        return;
      }
      if (!next.previewPath) {
        setError("Aucun extrait disponible pour ce beat.");
        setPlaying(false);
        setLoading(false);
        return;
      }
      const restorePosition = current?.id === next.id && !audio.ended ? audio.currentTime : 0;
      if (current?.id !== next.id) audio.pause();
      setLoading(true);
      setCurrent(next);
      currentRef.current = next;
      setProgress(0);
      setDuration(0);
      let youtubeFallbackStarted = false;
      try {
        const url =
          cachedUrl ??
          sharedCachedUrl ??
          (await signedUrl("previews", next.previewPath, { refresh: refreshUrl }));
        if (request !== playRequestRef.current) return;
        if (!url) {
          if (fallbackToYoutube(next)) {
            youtubeFallbackStarted = true;
          } else {
            setError("L'extrait audio est indisponible. Réessayez dans un instant.");
            setPlaying(false);
          }
          return;
        }
        previewUrlsRef.current.set(next.id, {
          path: next.previewPath,
          url,
          expiresAt: Date.now() + 55 * 60 * 1000,
        });
        audio.pause();
        audio.src = url;
        audio.load();
        if (restorePosition > 0) {
          await waitForAudioMetadata(audio);
          if (request !== playRequestRef.current) return;
          const maxPosition = Number.isFinite(audio.duration)
            ? Math.max(0, audio.duration - 0.1)
            : restorePosition;
          audio.currentTime = Math.min(restorePosition, maxPosition);
        }
        await audio.play();
        setPlaying(true);
        // One play event per beat per browser session — no inflated stats.
        void track("beat_play", { beatId: next.id, once: true });
      } catch (playError) {
        if (request === playRequestRef.current) {
          const alreadyUsingYoutube =
            currentRef.current?.id === next.id &&
            currentRef.current.mediaSource === "youtube";
          if (alreadyUsingYoutube) {
            youtubeFallbackStarted = true;
          } else if (
            !(playError instanceof DOMException && playError.name === "NotAllowedError") &&
            fallbackToYoutube(next)
          ) {
            youtubeFallbackStarted = true;
          } else {
            setError("Le navigateur a bloqué la lecture. Appuyez sur Lire pour réessayer.");
            setPlaying(false);
          }
        }
      } finally {
        if (request === playRequestRef.current && !youtubeFallbackStarted) setLoading(false);
      }
    },
    [current, error, finished, fallbackToYoutube],
  );

  const toggle = useCallback(
    (next?: PlayerTrack) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (next && next.id !== current?.id) {
        void play(next);
        return;
      }
      if (current?.mediaSource === "youtube") {
        if (!getYoutubeVideoId(current.youtubeUrl)) {
          setError("Aucune URL YouTube valide n'est disponible pour ce beat.");
          setPlaying(false);
          setLoading(false);
          return;
        }
        if (playing) {
          youtubeControlsRef.current?.pause();
          setPlaying(false);
        } else {
          if (error) {
            setError(null);
            setYoutubeRetryKey((key) => key + 1);
            setLoading(true);
          }
          if (finished) {
            youtubeControlsRef.current?.seek(0);
            setProgress(0);
            setFinished(false);
          }
          youtubeControlsRef.current?.play();
          setPlaying(true);
          setLoading(!youtubeControlsRef.current);
        }
        return;
      }
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else if (current) {
        void play(current);
      }
    },
    [current, error, finished, playing, play],
  );

  playRef.current = (track) => void play(track);

  useEffect(() => {
    mediaActionsRef.current = {
      play: () => {
        const track = currentRef.current;
        if (!track) return;
        if (track.mediaSource === "youtube") {
          if (finished) {
            youtubeControlsRef.current?.seek(0);
            setProgress(0);
            setFinished(false);
          }
          youtubeControlsRef.current?.play();
          setPlaying(true);
          setLoading(!youtubeControlsRef.current);
        } else {
          void playRef.current(track);
        }
      },
      pause: () => {
        if (currentRef.current?.mediaSource === "youtube") youtubeControlsRef.current?.pause();
        else audioRef.current?.pause();
        setPlaying(false);
      },
      next: () => {
        const queue = queueRef.current;
        const index = queue.findIndex((track) => track.id === currentRef.current?.id);
        const next = index >= 0 ? queue[index + 1] : undefined;
        if (next) playRef.current(next);
      },
      previous: () => {
        const track = currentRef.current;
        if (!track) return;
        if (progress > 3) {
          if (track.mediaSource === "youtube") youtubeControlsRef.current?.seek(0);
          else if (audioRef.current) audioRef.current.currentTime = 0;
          setProgress(0);
          return;
        }
        const queue = queueRef.current;
        const index = queue.findIndex((item) => item.id === track.id);
        const previous = queue[index - 1];
        if (previous) playRef.current(previous);
        else {
          if (track.mediaSource === "youtube") youtubeControlsRef.current?.seek(0);
          else if (audioRef.current) audioRef.current.currentTime = 0;
          setProgress(0);
        }
      },
      seek: (seconds) => {
        const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
        const position =
          durationRef.current > 0
            ? Math.min(durationRef.current, safeSeconds)
            : safeSeconds;
        if (currentRef.current?.mediaSource === "youtube")
          youtubeControlsRef.current?.seek(position);
        else if (audioRef.current) audioRef.current.currentTime = position;
        setProgress(position);
      },
    };
  }, [duration, finished, progress]);

  useEffect(() => {
    const session = getMediaSession();
    if (!session) return;
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: () => mediaActionsRef.current.play(),
      pause: () => mediaActionsRef.current.pause(),
      previoustrack: () => mediaActionsRef.current.previous(),
      nexttrack: () => mediaActionsRef.current.next(),
      seekto: (details) => {
        if (typeof details.seekTime === "number") mediaActionsRef.current.seek(details.seekTime);
      },
      seekbackward: (details) => {
        mediaActionsRef.current.seek(
          Math.max(0, progressRef.current - (details.seekOffset ?? 10)),
        );
      },
      seekforward: (details) => {
        const nextPosition = progressRef.current + (details.seekOffset ?? 10);
        mediaActionsRef.current.seek(
          durationRef.current > 0
            ? Math.min(durationRef.current, nextPosition)
            : nextPosition,
        );
      },
    };

    return registerMediaSessionHandlers(session, handlers);
  }, []);

  useEffect(() => {
    const session = getMediaSession();
    if (!session) return;
    if (!current) {
      setMediaSessionMetadata(session, null);
      setMediaSessionPlaybackState(session, "none");
      clearMediaSessionPosition(session);
      return;
    }

    const fallbackArtwork = [
      { src: "/icons/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ];
    if (typeof MediaMetadata !== "function") return;
    const metadata = (artwork: MediaImage[]) =>
      new MediaMetadata({
        title: current.title,
        artist: "DANY BEATS",
        album: current.bpm ? `${current.bpm} BPM · Extrait` : "Extrait",
        artwork,
      });
    try {
      setMediaSessionMetadata(session, metadata(fallbackArtwork));
    } catch {
      return;
    }

    let cancelled = false;
    const updateArtwork = async () => {
      try {
        const artworkUrl =
          current.youtubeUrl
            ? youtubeThumbnailUrl(current.youtubeUrl)
            : await signedUrl("covers", current.coverPath);
        if (!cancelled && artworkUrl) {
          setMediaSessionMetadata(session, metadata([{ src: artworkUrl }]));
        }
      } catch (error) {
        if (!cancelled) console.error("Impossible de charger la pochette Media Session.", error);
      }
    };
    void updateArtwork();
    return () => {
      cancelled = true;
    };
  }, [current]);

  useEffect(() => {
    const session = getMediaSession();
    if (!session) return;
    setMediaSessionPlaybackState(session, playing ? "playing" : current ? "paused" : "none");
    if (duration > 0) setMediaSessionPosition(session, progress, duration);
    else clearMediaSessionPosition(session);
  }, [current, duration, playing, progress]);

  const seek = useCallback((seconds: number) => {
    if (currentRef.current?.mediaSource === "youtube") {
      youtubeControlsRef.current?.seek(seconds);
      setProgress(seconds);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setProgress(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = value;
    youtubeControlsRef.current?.setVolume(value);
    setVolumeState(value);
  }, []);

  const setLoop = useCallback((value: boolean) => {
    loopRef.current = value;
    setLoopState(value);
  }, []);

  const stop = useCallback(() => {
    playRequestRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    youtubeControlsRef.current?.pause();
    youtubeControlsRef.current = null;
    setPlaying(false);
    setFinished(false);
    setCurrent(null);
    currentRef.current = null;
    queueRef.current = [];
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        current,
        youtubeRetryKey,
        playing,
        finished,
        loading,
        error,
        progress,
        duration,
        volume,
        loop,
        setQueue,
        play: (t, queue) => void play(t, queue),
        toggle,
        setLoop,
        seek,
        setVolume,
        registerYoutubeControls,
        setYoutubePlaying,
        setYoutubeProgress,
        setYoutubeError,
        finishYoutube,
        stop,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
