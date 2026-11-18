const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function youtubePlaybackErrorMessage(code?: number) {
  const messages: Record<number, string> = {
    2: "Le lien YouTube de ce beat est invalide.",
    5: "La vidéo YouTube ne peut pas être lue dans ce lecteur.",
    100: "Cette vidéo est privée ou a été supprimée sur YouTube.",
    101: "Le propriétaire de cette vidéo bloque sa lecture sur les autres sites.",
    150: "Le propriétaire de cette vidéo bloque sa lecture sur les autres sites.",
    153: "YouTube n'a pas pu vérifier l'origine de cette requête. Réessayez.",
  };

  if (code === undefined) {
    return "Le lecteur YouTube n'a pas pu démarrer. Vérifiez que YouTube n'est pas bloqué, puis appuyez sur Lire pour réessayer.";
  }
  return messages[code] ?? "Cette vidéo YouTube est indisponible ou ne peut pas être lue.";
}

export function getYoutubeVideoId(value: string | null | undefined) {
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  let videoId: string | undefined;

  if (hostname === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0];
  } else if (hostname === "youtube.com" || hostname === "music.youtube.com") {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") ?? undefined;
    } else {
      const [format, id] = url.pathname.split("/").filter(Boolean);
      if (["embed", "live", "shorts"].includes(format ?? "")) videoId = id;
    }
  }

  return videoId && VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
}

export function youtubeThumbnailUrl(value: string | null | undefined) {
  const videoId = getYoutubeVideoId(value);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function youtubeEmbedUrl(
  value: string | null | undefined,
  options: {
    enableApi?: boolean;
    autoPlay?: boolean;
    controls?: boolean;
    origin?: string;
  } = {},
) {
  const videoId = getYoutubeVideoId(value);
  if (!videoId) return null;

  const params = new URLSearchParams({ playsinline: "1", rel: "0" });
  if (options.enableApi) params.set("enablejsapi", "1");
  if (options.autoPlay) params.set("autoplay", "1");
  if (options.controls === false) params.set("controls", "0");
  if (options.origin) params.set("origin", options.origin);
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
