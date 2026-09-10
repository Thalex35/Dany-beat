import { Link } from "@tanstack/react-router";
import { Download, Ear, Mail, Pause, Play, RotateCcw } from "lucide-react";

import { CartButton } from "@/components/site/CartButton";
import { Cover } from "@/components/site/Cover";
import { LikeButton } from "@/components/site/LikeButton";
import { useSettings } from "@/lib/settings";
import { openEmail } from "@/lib/contact";
import { formatCount, formatPrice, type Beat, type BeatStats } from "@/lib/beats";
import { useSignedUrl } from "@/lib/media";
import { usePlayer } from "@/lib/player";

export function BeatCard({
  beat,
  stats,
  queue,
}: {
  beat: Beat;
  stats?: BeatStats;
  queue?: Beat[];
}) {
  const { current, playing, finished, toggle, play } = usePlayer();
  const { data: settings } = useSettings();
  const { data: previewUrl } = useSignedUrl("previews", beat.preview_path);
  const isCurrent = current?.id === beat.id;
  const isPlaying = isCurrent && playing;

  return (
    <article className="group flex min-w-0 flex-col gap-4 overflow-hidden">
      <div className="public-beat-art relative aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-border">
        <Link
          to="/beats/$slug"
          params={{ slug: beat.slug }}
          aria-label={`Ouvrir ${beat.title}`}
          className="block h-full w-full"
        >
          <Cover
            path={beat.cover_path}
            alt={`Pochette de ${beat.title}`}
            className="h-full w-full"
          />
        </Link>
        {beat.bpm ? (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-background/90 px-2 py-1 text-[10px] font-medium tracking-wide uppercase backdrop-blur-sm">
            {beat.bpm} BPM
          </div>
        ) : null}
        {beat.featured ? (
          <div className="pointer-events-none absolute top-3 left-3 rounded bg-primary px-2 py-1 text-[10px] font-medium tracking-wide text-primary-foreground uppercase">
            À la une
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium">
            <Link to="/beats/$slug" params={{ slug: beat.slug }} className="hover:text-primary">
              {beat.title}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[beat.genre, beat.mood].filter(Boolean).join(" • ") || "Instrumentale"}
          </p>
        </div>
        <span className="shrink-0 font-display text-sm font-medium text-primary">
          {formatPrice(beat.price)}
        </span>
      </div>

      <div className="public-beat-actions flex items-center gap-4">
        <button
          type="button"
          onClick={() => {
            const track = {
              id: beat.id,
              title: beat.title,
              slug: beat.slug,
              bpm: beat.bpm,
              coverPath: beat.cover_path,
              previewPath: beat.preview_path,
            };
            if (queue) {
              play(
                track,
                queue.map((item) => ({
                  id: item.id,
                  title: item.title,
                  slug: item.slug,
                  bpm: item.bpm,
                  coverPath: item.cover_path,
                  previewPath: item.preview_path,
                })),
              );
            } else {
              toggle(track);
            }
          }}
          aria-label={
            finished && isCurrent
              ? `Rejouer ${beat.title}`
              : isPlaying
                ? `Mettre ${beat.title} en pause`
                : `Écouter ${beat.title}`
          }
          className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
        >
          {finished && isCurrent ? (
            <RotateCcw className="size-4" />
          ) : isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </button>
        <div className="flex items-center gap-5 text-[10px] tracking-widest text-muted-foreground uppercase">
          <span
            className="inline-flex items-center gap-1"
            title={`${formatCount(stats?.plays)} écoutes`}
          >
            <Ear className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{formatCount(stats?.plays)} écoutes</span>
            <span aria-hidden="true">{formatCount(stats?.plays)}</span>
          </span>
          <LikeButton beatId={beat.id} count={stats?.likes} />
        </div>
        {previewUrl ? (
          <a
            href={previewUrl}
            download={`${beat.slug}-preview.mp3`}
            aria-label={`Télécharger l'extrait de ${beat.title}`}
            title="Télécharger l'extrait"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Download className="size-4" aria-hidden="true" />
          </a>
        ) : null}
        {settings?.contact_email ? (
          <button
            type="button"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Envoyer un e-mail à propos de ${beat.title}`}
            title="Envoyer par e-mail"
            onClick={() =>
              openEmail({
                to: settings.contact_email,
                subject: `Demande de licence : ${beat.title}`,
                body: `Bonjour,\n\nJe suis intéressé par le beat « ${beat.title} ».\n\nPouvez-vous me renseigner sur les licences disponibles ?\n\nMerci.`,
              })
            }
          >
            <Mail className="size-4" aria-hidden="true" />
          </button>
        ) : null}
        <CartButton beatId={beat.id} className="ml-auto" />
      </div>
    </article>
  );
}
