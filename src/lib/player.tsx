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
import { getYoutubeVideoId } from "@/lib/youtube";

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
    mediaSource: beat.media_source,
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
      if (loopRef.current && currentRef.current) {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      const currentIndex = queueRef.current.findIndex(
        (track) => track.id === currentRef.current?.id,
      );
      const next = queueRef.current[currentIndex + 1];
      if (next) {
        playRef.current(next);
        return;
      }
      setPlaying(false);
      setFinished(true);
    };
    const onErr = () => {
      setError("Cet extrait n'a pas pu être chargé.");
      setPlaying(false);
      setLoading(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onErr);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
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
    if (loopRef.current) {
      youtubeControlsRef.current?.seek(0);
      youtubeControlsRef.current?.play();
      setProgress(0);
      setPlaying(true);
      return;
    }
    const currentIndex = queueRef.current.findIndex((track) => track.id === currentTrack.id);
    const next = queueRef.current[currentIndex + 1];
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
      if (queue) queueRef.current = queue;
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
        audio.removeAttribute("src");
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
          setError("Playback was blocked by the browser.");
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
      const url = await signedUrl("previews", next.previewPath);
      if (!url) {
        setLoading(false);
        setError("Audio file unavailable.");
        return;
      }
      audio.src = url;
      audio.load();
      try {
        await audio.play();
        setPlaying(true);
        // One play event per beat per browser session — no inflated stats.
        void track("beat_play", { beatId: next.id, once: true });
      } catch {
        setError("Playback was blocked by the browser.");
      } finally {
        setLoading(false);
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
