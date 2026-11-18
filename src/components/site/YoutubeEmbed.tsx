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
const youtubeApiUrl = "https://www.youtube.com/iframe_api";

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    let timeoutId: number | null = null;
    const fail = (error: Error) => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      document.querySelector<HTMLScriptElement>(`script[src="${youtubeApiUrl}"]`)?.remove();
      reject(error);
    };
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        previousCallback?.();
      } finally {
        if (window.YT?.Player) {
          if (timeoutId !== null) window.clearTimeout(timeoutId);
          resolve(window.YT);
        } else {
          fail(new Error("YouTube Player API did not initialize."));
        }
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${youtubeApiUrl}"]`);
    if (existingScript) {
      existingScript.addEventListener(
        "error",
        () => fail(new Error("YouTube Player API could not be loaded.")),
        { once: true },
      );
    } else {
      const script = document.createElement("script");
      script.src = youtubeApiUrl;
      script.async = true;
      script.onerror = () => fail(new Error("YouTube Player API could not be loaded."));
      document.head.appendChild(script);
    }
    timeoutId = window.setTimeout(
      () => fail(new Error("YouTube Player API did not respond.")),
      15_000,
    );
  }).catch((error: unknown) => {
    document.querySelector<HTMLScriptElement>(`script[src="${youtubeApiUrl}"]`)?.remove();
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
}

export function YoutubeEmbed({
  url,
  title,
  autoPlay = false,
  hideVideo = false,
  hideControls = false,
  onControls,
  onPlay,
  onPause,
  onEnded,
  onProgress,
  onError,
  retryKey = 0,
}: {
  url: string;
  title: string;
  autoPlay?: boolean;
  hideVideo?: boolean;
  hideControls?: boolean;
  onControls?: (controls: YoutubeControls | null) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onProgress?: (progress: number, duration: number) => void;
  onError?: (code?: number) => void;
  retryKey?: number;
}) {
  const iframeId = useId().replace(/:/g, "");
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const onControlsRef = useRef(onControls);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const onErrorRef = useRef(onError);
  const videoId = getYoutubeVideoId(url);
  const embedUrl = youtubeEmbedUrl(url, {
    enableApi: true,
    autoPlay,
    controls: !hideControls,
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
    onErrorRef.current = onError;
  }, [onControls, onEnded, onError, onPause, onPlay, onProgress]);

  useEffect(() => {
    const initialEmbedUrl = initialEmbedUrlRef.current;
    if (!initialEmbedUrl) return;
    const container = playerContainerRef.current;
    if (!container) return;

    let disposed = false;
    let player: YouTubePlayer | null = null;
    let progressTimer: number | null = null;
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
                if (data === youtube.PlayerState.PAUSED) onPauseRef.current?.();
                if (data === youtube.PlayerState.ENDED) onEndedRef.current?.();
              }
            },
            onError: ({ data, target }) => {
              if (getYoutubeVideoId(target.getVideoUrl()) === videoIdRef.current) {
                if (progressTimer !== null) window.clearInterval(progressTimer);
                progressTimer = null;
                onErrorRef.current?.(data);
              }
            },
          },
        });
      })
      .catch((error: unknown) => {
        if (!disposed) {
          onErrorRef.current?.();
          console.error(error);
        }
      });

    return () => {
      disposed = true;
      playerReadyRef.current = false;
      playerRef.current = null;
      if (progressTimer !== null) window.clearInterval(progressTimer);
      onControlsRef.current?.(null);
      player?.destroy();
      container.replaceChildren();
    };
  }, [iframeId, retryKey]);

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
      className={hideVideo ? "hidden" : "aspect-video min-h-50 w-full overflow-hidden rounded-2xl bg-black"}
      aria-hidden={hideVideo}
    >
      <div ref={playerContainerRef} className="relative size-full" />
    </div>
  );
}
