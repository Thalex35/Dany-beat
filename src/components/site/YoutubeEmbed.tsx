import { youtubeEmbedUrl } from "@/lib/youtube";

export function YoutubeEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = youtubeEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <iframe
      src={embedUrl}
      title={`YouTube player: ${title}`}
      className="aspect-video min-h-50 w-full rounded-2xl bg-black"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      loading="lazy"
    />
  );
}