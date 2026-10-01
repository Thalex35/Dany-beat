import { useEffect, useId, useRef } from "react";

import type { YoutubeControls } from "@/lib/player";
import { youtubeEmbedUrl } from "@/lib/youtube";

type YouTubePlayer = {
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
};

type YouTubeApi = {
  Player: new (
    elementId: string,
    options: {
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number }) => void;
        onError: () => void;
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
    script.onerror = () => reject(new Error("YouTube Player API could not be loaded."));
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
  autoPlay = false,
  hideVideo = false,
  hideControls = false,
  onControls,
  onPlay,
  onPause,
  onEnded,
  onProgress,
  onError,
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
  onError?: () => void;
}) {
  const iframeId = useId().replace(/:/g, "");
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const onControlsRef = useRef(onControls);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const onErrorRef = useRef(onError);
  const embedUrl = youtubeEmbedUrl(url, { enableApi: true, autoPlay, controls: !hideControls });

  useEffect(() => {
    onControlsRef.current = onControls;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
    onEndedRef.current = onEnded;
    onProgressRef.current = onProgress;
    onErrorRef.current = onError;
  }, [onControls, onEnded, onError, onPause, onPlay, onProgress]);

  useEffect(() => {
    if (!embedUrl) return;
    const container = playerContainerRef.current;
    if (!container) return;

    let disposed = false;
    let player: YouTubePlayer | null = null;
    let progressTimer: number | null = null;
    const iframe = document.createElement("iframe");
    iframe.id = iframeId;
    iframe.src = embedUrl;
    iframe.title = `YouTube player: ${title}`;
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
              target.getIframe().title = `YouTube player: ${title}`;
              const controls: YoutubeControls = {
                play: () => target.playVideo(),
                pause: () => target.pauseVideo(),
                seek: (seconds) => target.seekTo(seconds, true),
                setVolume: (value) => target.setVolume(Math.round(value * 100)),
              };
              onControlsRef.current?.(controls);
            },
            onStateChange: ({ data }) => {
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
            onError: () => onErrorRef.current?.(),
          },
        });
      })
      .catch((error: unknown) => {
        onErrorRef.current?.();
        console.error(error);
      });

    return () => {
      disposed = true;
      if (progressTimer !== null) window.clearInterval(progressTimer);
      onControlsRef.current?.(null);
      player?.destroy();
      container.replaceChildren();
    };
  }, [embedUrl, iframeId, title]);

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
