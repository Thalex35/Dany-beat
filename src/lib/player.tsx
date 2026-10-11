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
import { signedUrl } from "@/lib/media";
import { getYoutubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";

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

type PlayerValue = {
  current: PlayerTrack | null;
  playing: boolean;
  finished: boolean;
  loading: boolean;
  error: string | null;
  progress: number;
  duration: number;
  volume: number;
  loop: boolean;
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  toggle: (track?: PlayerTrack) => void;
  setLoop: (value: boolean) => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  registerYoutubeControls: (controls: YoutubeControls | null) => void;
  setYoutubePlaying: (value: boolean) => void;
  setYoutubeProgress: (progress: number, duration: number) => void;
  setYoutubeError: () => void;
  finishYoutube: () => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayerTrack | null>(null);
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
  const volumeRef = useRef(volume);
  playingRef.current = playing;
  volumeRef.current = volume;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.9;
    audioRef.current = audio;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (!audio.ended || currentRef.current?.mediaSource === "youtube") return;
      const request = playRequestRef.current;
      if (endedRequestRef.current === request) return;
      endedRequestRef.current = request;
      if (loopRef.current && currentRef.current) {
        audio.currentTime = 0;
        endedRequestRef.current = null;
        void audio.play().catch(() => {
          setError("Le navigateur a interrompu la lecture. Appuyez sur Lire pour reprendre.");
          setPlaying(false);
        });
        return;
      }
      const currentIndex = queueRef.current.findIndex(
        (track) => track.id === currentRef.current?.id,
      );
      const next = currentIndex >= 0 ? queueRef.current[currentIndex + 1] : undefined;
      if (next) {
        playRef.current(next);
        return;
      }
      setPlaying(false);
      setFinished(true);
    };
    const onPlay = () => {
      setPlaying(true);
      setFinished(false);
    };
    const onPause = () => setPlaying(false);
    const onErr = () => {
      setError("Cet extrait n'a pas pu être chargé.");
      setPlaying(false);
      setLoading(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onErr);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onErr);
    };
  }, []);

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

  const setYoutubeError = useCallback(() => {
    setError("La vidéo YouTube n'a pas pu être chargée.");
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
    const currentIndex = queueRef.current.findIndex((track) => track.id === currentTrack.id);
    const next = currentIndex >= 0 ? queueRef.current[currentIndex + 1] : undefined;
    if (next) {
      playRef.current(next);
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
      const queueIndex = queueRef.current.findIndex((track) => track.id === next.id);
      const upcomingTrack = queueIndex >= 0 ? queueRef.current[queueIndex + 1] : undefined;
      if (upcomingTrack?.mediaSource !== "youtube" && upcomingTrack?.previewPath) {
        const cachedUpcoming = previewUrlsRef.current.get(upcomingTrack.id);
        if (
          cachedUpcoming?.path !== upcomingTrack.previewPath ||
          cachedUpcoming.expiresAt <= Date.now()
        ) {
          void signedUrl("previews", upcomingTrack.previewPath).then((url) => {
            if (url) {
              previewUrlsRef.current.set(upcomingTrack.id, {
                path: upcomingTrack.previewPath!,
                url,
                expiresAt: Date.now() + 55 * 60 * 1000,
              });
            }
          });
        }
      }
      setError(null);
      setFinished(false);

      if (next.mediaSource === "youtube") {
        if (!next.youtubeUrl || !getYoutubeVideoId(next.youtubeUrl)) {
          setError("Aucune URL YouTube disponible pour ce beat.");
          return;
        }
        if (current?.id === next.id && current.mediaSource === "youtube") {
          if (finished) {
            youtubeControlsRef.current?.seek(0);
            setProgress(0);
          }
          youtubeControlsRef.current?.play();
          setPlaying(true);
          setLoading(!youtubeControlsRef.current);
          return;
        }
        audio.pause();
        setPlaying(false);
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
      if (current?.id === next.id && audio.src) {
        if (audio.ended) audio.currentTime = 0;
        try {
          await audio.play();
          setPlaying(true);
        } catch {
          if (request === playRequestRef.current) {
            setError("Le navigateur a bloqué la lecture. Appuyez sur Lire pour réessayer.");
            setPlaying(false);
          }
        }
        return;
      }
      if (!next.previewPath) {
        setError("Aucun extrait disponible pour ce beat.");
        return;
      }
      setLoading(true);
      setCurrent(next);
      currentRef.current = next;
      setProgress(0);
      setDuration(0);
      try {
        const cachedPreview = previewUrlsRef.current.get(next.id);
        const cachedUrl =
          cachedPreview?.path === next.previewPath && cachedPreview.expiresAt > Date.now()
            ? cachedPreview.url
            : null;
        const url = cachedUrl ?? (await signedUrl("previews", next.previewPath));
        if (request !== playRequestRef.current) return;
        if (!url) {
          setError("Audio file unavailable.");
          return;
        }
        previewUrlsRef.current.set(next.id, {
          path: next.previewPath,
          url,
          expiresAt: Date.now() + 55 * 60 * 1000,
        });
        audio.src = url;
        audio.load();
        await audio.play();
        setPlaying(true);
        // One play event per beat per browser session — no inflated stats.
        void track("beat_play", { beatId: next.id, once: true });
      } catch {
        if (request === playRequestRef.current) {
          setError("Le navigateur a bloqué la lecture. Appuyez sur Lire pour réessayer.");
          setPlaying(false);
        }
      } finally {
        if (request === playRequestRef.current) setLoading(false);
      }
    },
    [current],
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
        if (playing) {
          youtubeControlsRef.current?.pause();
          setPlaying(false);
        } else {
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
    [current, playing, play],
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
        if (currentRef.current?.mediaSource === "youtube")
          youtubeControlsRef.current?.seek(seconds);
        else if (audioRef.current) audioRef.current.currentTime = seconds;
        setProgress(seconds);
      },
    };
  }, [finished, progress]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const actions: MediaSessionAction[] = [
      "play",
      "pause",
      "previoustrack",
      "nexttrack",
      "seekbackward",
      "seekforward",
      "seekto",
    ];
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: () => mediaActionsRef.current.play(),
      pause: () => mediaActionsRef.current.pause(),
      previoustrack: () => mediaActionsRef.current.previous(),
      nexttrack: () => mediaActionsRef.current.next(),
      seekto: (details) => {
        if (typeof details.seekTime === "number") mediaActionsRef.current.seek(details.seekTime);
      },
      seekbackward: (details) => {
        mediaActionsRef.current.seek(Math.max(0, progress - (details.seekOffset ?? 10)));
      },
      seekforward: (details) => {
        const nextPosition = progress + (details.seekOffset ?? 10);
        mediaActionsRef.current.seek(duration > 0 ? Math.min(duration, nextPosition) : nextPosition);
      },
    };

    for (const action of actions) {
      try {
        session.setActionHandler(action, handlers[action] ?? null);
      } catch {
        // Browsers can expose Media Session without supporting every action.
      }
    }
    return () => {
      for (const action of actions) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // Unsupported actions do not need cleanup.
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    if (!current) {
      session.metadata = null;
      session.playbackState = "none";
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
    session.metadata = metadata(fallbackArtwork);

    let cancelled = false;
    const updateArtwork = async () => {
      try {
        const artworkUrl =
          current.youtubeUrl
            ? youtubeThumbnailUrl(current.youtubeUrl)
            : await signedUrl("covers", current.coverPath);
        if (!cancelled && artworkUrl) session.metadata = metadata([{ src: artworkUrl }]);
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
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.playbackState = playing ? "playing" : current ? "paused" : "none";
    if (duration > 0 && typeof session.setPositionState === "function") {
      try {
        session.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.min(progress, duration),
        });
      } catch {
        // Ignore invalid or unsupported position state updates.
      }
    }
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
        playing,
        finished,
        loading,
        error,
        progress,
        duration,
        volume,
        loop,
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
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
