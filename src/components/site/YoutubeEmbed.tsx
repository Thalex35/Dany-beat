import { useEffect, useId, useRef } from "react";

import type { YoutubeControls } from "@/lib/player";
import { getYoutubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";

type YouTubePlayer = {
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoUrl: () => string;
  loadVideoById: (videoId: string) => void;
};

type YouTubeApi = {
  Player: new (
    elementId: string,
    options: {
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number; target: YouTubePlayer }) => void;
        onError: (event: { data: number; target: YouTubePlayer }) => void;
        onAutoplayBlocked: () => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { ENDED: number; PAUSED: number; PLAYING: number };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube Player API did not initialize."));
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      script.remove();
      reject(new Error("YouTube Player API could not be loaded."));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
}

export function YoutubeEmbed({
  url,
  title,
  className,
  onControls,
  onPlay,
  onPause,
  onEnded,
  onProgress,
  onVolume,
  onError,
}: {
  url: string;
  title: string;
  className?: string;
  onControls?: (controls: YoutubeControls | null) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onProgress?: (progress: number, duration: number) => void;
  onVolume?: (volume: number) => void;
  onError?: (code?: number) => void;
}) {
  const iframeId = useId().replace(/:/g, "");
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const onControlsRef = useRef(onControls);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const onVolumeRef = useRef(onVolume);
  const onErrorRef = useRef(onError);
  const videoId = getYoutubeVideoId(url);
  const embedUrl = youtubeEmbedUrl(url, {
    enableApi: true,
    origin: typeof window === "undefined" ? undefined : window.location.origin,
  });
  const initialEmbedUrlRef = useRef(embedUrl);
  const videoIdRef = useRef(videoId);
  const titleRef = useRef(title);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerReadyRef = useRef(false);
  const loadedVideoIdRef = useRef(videoId);
  videoIdRef.current = videoId;
  titleRef.current = title;

  useEffect(() => {
    onControlsRef.current = onControls;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
    onEndedRef.current = onEnded;
    onProgressRef.current = onProgress;
    onVolumeRef.current = onVolume;
    onErrorRef.current = onError;
  }, [onControls, onEnded, onError, onPause, onPlay, onProgress, onVolume]);

  useEffect(() => {
    const initialEmbedUrl = initialEmbedUrlRef.current;
    if (!initialEmbedUrl) return;
    const container = playerContainerRef.current;
    if (!container) return;

    let disposed = false;
    let player: YouTubePlayer | null = null;
    let progressTimer: number | null = null;
    let volumeTimer: number | null = null;
    const iframe = document.createElement("iframe");
    iframe.id = iframeId;
    iframe.src = initialEmbedUrl;
    iframe.title = `YouTube player: ${titleRef.current}`;
    iframe.allow =
      "autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.className = "absolute inset-0 size-full border-0";
    container.replaceChildren(iframe);

    void loadYouTubeApi()
      .then((youtube) => {
        if (disposed) return;
        player = new youtube.Player(iframeId, {
          events: {
            onReady: ({ target }) => {
              if (disposed) {
                target.destroy();
                return;
              }
              playerRef.current = target;
              playerReadyRef.current = true;
              volumeTimer = window.setInterval(() => {
                if (!player) return;
                const actualVolume = player.isMuted() ? 0 : player.getVolume() / 100;
                onVolumeRef.current?.(actualVolume);
              }, 500);
              const currentVideoId = videoIdRef.current;
              if (currentVideoId && currentVideoId !== loadedVideoIdRef.current) {
                target.loadVideoById(currentVideoId);
                loadedVideoIdRef.current = currentVideoId;
              }
              target.getIframe().title = `YouTube player: ${titleRef.current}`;
              const controls: YoutubeControls = {
                play: () => target.playVideo(),
                pause: () => target.pauseVideo(),
                seek: (seconds) => target.seekTo(seconds, true),
                setVolume: (value) => target.setVolume(Math.round(value * 100)),
                loadVideo: (nextVideoId) => {
                  videoIdRef.current = nextVideoId;
                  loadedVideoIdRef.current = nextVideoId;
                  target.loadVideoById(nextVideoId);
                },
              };
              onControlsRef.current?.(controls);
            },
            onStateChange: ({ data, target }) => {
              if (getYoutubeVideoId(target.getVideoUrl()) !== videoIdRef.current) return;
              if (data === youtube.PlayerState.PLAYING) {
                onPlayRef.current?.();
                if (progressTimer === null) {
                  progressTimer = window.setInterval(() => {
                    if (!player) return;
                    onProgressRef.current?.(player.getCurrentTime(), player.getDuration());
                  }, 500);
                }
              } else {
                if (progressTimer !== null) window.clearInterval(progressTimer);
                progressTimer = null;
                onProgressRef.current?.(target.getCurrentTime(), target.getDuration());
                if (data === youtube.PlayerState.PAUSED) onPauseRef.current?.();
                if (data === youtube.PlayerState.ENDED) onEndedRef.current?.();
              }
            },
            onError: ({ data, target }) => {
              if (getYoutubeVideoId(target.getVideoUrl()) === videoIdRef.current) {
                onErrorRef.current?.(data);
              }
            },
            onAutoplayBlocked: () => onErrorRef.current?.(),
          },
        });
      })
      .catch((error: unknown) => {
        onErrorRef.current?.();
        console.error(error);
      });

    return () => {
      disposed = true;
      playerReadyRef.current = false;
      playerRef.current = null;
      if (progressTimer !== null) window.clearInterval(progressTimer);
      if (volumeTimer !== null) window.clearInterval(volumeTimer);
      onControlsRef.current?.(null);
      player?.destroy();
      container.replaceChildren();
    };
  }, [iframeId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !playerReadyRef.current || !videoId) return;

    player.getIframe().title = `YouTube player: ${title}`;
    if (videoId === loadedVideoIdRef.current) return;

    player.loadVideoById(videoId);
    loadedVideoIdRef.current = videoId;
  }, [title, videoId]);

  if (!embedUrl) return null;

  return (
    <div
      className={`${className ?? "aspect-video min-h-[200px] min-w-[200px] w-full"} relative overflow-hidden rounded-xl bg-black`}
    >
      <div ref={playerContainerRef} className="relative size-full" />
    </div>
  );
}
