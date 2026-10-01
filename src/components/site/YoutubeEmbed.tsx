import { useEffect, useId, useRef } from "react";

import { youtubeEmbedUrl } from "@/lib/youtube";

type YouTubePlayer = {
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
};

type YouTubeApi = {
  Player: new (
    elementId: string,
    options: {
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { ENDED: number; PLAYING: number };
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
  onPlay,
  onEnded,
}: {
  url: string;
  title: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onEnded?: () => void;
}) {
  const iframeId = useId().replace(/:/g, "");
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const onPlayRef = useRef(onPlay);
  const onEndedRef = useRef(onEnded);
  const embedUrl = youtubeEmbedUrl(url, { enableApi: true, autoPlay });

  useEffect(() => {
    onPlayRef.current = onPlay;
    onEndedRef.current = onEnded;
  }, [onEnded, onPlay]);

  useEffect(() => {
    if (!embedUrl) return;
    const container = playerContainerRef.current;
    if (!container) return;

    let disposed = false;
    let player: YouTubePlayer | null = null;
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
            },
            onStateChange: ({ data }) => {
              if (data === youtube.PlayerState.PLAYING) onPlayRef.current?.();
              if (data === youtube.PlayerState.ENDED) onEndedRef.current?.();
            },
          },
        });
      })
      .catch((error: unknown) => console.error(error));

    return () => {
      disposed = true;
      player?.destroy();
      container.replaceChildren();
    };
  }, [embedUrl, iframeId, title]);

  if (!embedUrl) return null;

  return (
    <div className="aspect-video min-h-50 w-full overflow-hidden rounded-2xl bg-black">
      <div ref={playerContainerRef} className="relative size-full" />
    </div>
  );
}
