const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

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
  } else if (hostname === "youtube.com") {
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

export function youtubeEmbedUrl(value: string | null | undefined) {
  const videoId = getYoutubeVideoId(value);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0` : null;
}