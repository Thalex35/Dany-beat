import { Disc3 } from "lucide-react";

import { useSignedUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { youtubeThumbnailUrl } from "@/lib/youtube";

export function Cover({
  path,
  alt,
  className,
  sizes,
  youtubeUrl,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  youtubeUrl?: string | null;
}) {
  const { data: url, isPending } = useSignedUrl("covers", path);
  const youtubeUrlForImage = youtubeThumbnailUrl(youtubeUrl);

  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      {youtubeUrlForImage ? (
        <>
          <div className="absolute inset-0 grid place-items-center text-muted-foreground/40">
            <Disc3 className="size-10" aria-hidden="true" />
          </div>
          <img
            src={youtubeUrlForImage}
            alt={alt}
            loading="lazy"
            decoding="async"
            sizes={sizes}
            onError={(event) => event.currentTarget.remove()}
            className="relative h-full w-full object-cover"
          />
        </>
      ) : url ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          sizes={sizes}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-muted-foreground/40">
          {path && isPending ? (
            <div className="h-full w-full animate-pulse bg-surface-2" />
          ) : (
            <Disc3 className="size-10" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}
