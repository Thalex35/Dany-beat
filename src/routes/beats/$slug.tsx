import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

import { BeatCard } from "@/components/site/BeatCard";
import { Comments } from "@/components/site/Comments";
import { Cover } from "@/components/site/Cover";
import { LikeButton } from "@/components/site/LikeButton";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { track } from "@/lib/analytics";
import {
  beatBySlugQuery,
  beatStatsQuery,
  formatCount,
  formatPrice,
  publishedBeatsQuery,
  type Beat,
} from "@/lib/beats";
import { usePlayer } from "@/lib/player";
import { startPurchase } from "@/lib/purchase";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/beats/$slug")({
  loader: async ({ params, context }) => {
    const beat = await context.queryClient.ensureQueryData(beatBySlugQuery(params.slug));
    if (!beat) throw notFound();
    return { beat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.beat.title} | Dany Beats` },
          {
            name: "description",
            content:
              loaderData.beat.description ??
              `Preview and license "${loaderData.beat.title}" — an original instrumental from Dany Beats.`,
          },
          { property: "og:title", content: `${loaderData.beat.title} | Dany Beats` },
          { property: "og:type", content: "music.song" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Beat not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This instrumental may have been unpublished or moved.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/beats">Back to the catalog</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
  component: BeatDetailPage,
});

function BeatDetailPage() {
  const { slug } = Route.useParams();
  const { beat: initialBeat } = Route.useLoaderData();
  const beatQuery = useQuery(beatBySlugQuery(slug));
  const beat = beatQuery.data ?? initialBeat;

  const stats = useQuery(beatStatsQuery);
  const allBeats = useQuery(publishedBeatsQuery);
  const { data: settings } = useSettings();
  const { current, playing, toggle } = usePlayer();

  const [licenseId, setLicenseId] = useState<string>(beat.licenses[0]?.id ?? "");

  useEffect(() => {
    void track("beat_view", { beatId: beat.id, once: true });
  }, [beat.id]);

  const isCurrent = current?.id === beat.id;
  const isPlaying = isCurrent && playing;
  const s = stats.data?.[beat.id];

  const selectedLicense = beat.licenses.find((l) => l.id === licenseId) ?? beat.licenses[0];
  const displayPrice = selectedLicense?.price ?? beat.price;

  const related = (allBeats.data ?? [])
    .filter((b) => b.id !== beat.id && (b.genre === beat.genre || b.mood === beat.mood))
    .slice(0, 3);

  function handlePurchase() {
    if (!settings?.whatsapp_number) return;
    startPurchase({
      beatId: beat.id,
      beatTitle: beat.title,
      licenseName: selectedLicense?.name ?? null,
      price: displayPrice,
      producerName: settings.producer_name,
      whatsappNumber: settings.whatsapp_number,
    });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="aspect-square w-full overflow-hidden rounded-3xl ring-1 ring-border">
            <Cover
              path={beat.cover_path}
              alt={`${beat.title} cover art`}
              className="h-full w-full"
            />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.3em] text-primary uppercase">
              {[beat.genre, beat.mood].filter(Boolean).join(" • ") || "Instrumental"}
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tighter sm:text-5xl">
              {beat.title}
            </h1>

            <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-border py-5 text-sm">
              <div>
                <dt className="text-[10px] tracking-widest text-muted-foreground uppercase">BPM</dt>
                <dd className="mt-1 font-medium">{beat.bpm ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-widest text-muted-foreground uppercase">Key</dt>
                <dd className="mt-1 font-medium">{beat.song_key ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  Price
                </dt>
                <dd className="mt-1 font-medium">{formatPrice(displayPrice)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex items-center gap-5">
              <button
                type="button"
                onClick={() =>
                  toggle({
                    id: beat.id,
                    title: beat.title,
                    slug: beat.slug,
                    bpm: beat.bpm,
                    coverPath: beat.cover_path,
                    previewPath: beat.preview_path,
                  })
                }
                aria-label={isPlaying ? `Pause ${beat.title}` : `Play ${beat.title}`}
                className="grid size-12 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              </button>
              <div className="flex items-center gap-5 text-[11px] tracking-widest text-muted-foreground uppercase">
                <span>{formatCount(s?.plays)} Plays</span>
                <LikeButton beatId={beat.id} count={s?.likes} />
              </div>
            </div>

            {beat.description ? (
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {beat.description}
              </p>
            ) : null}

            {beat.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {beat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-surface px-3 py-1 text-[10px] tracking-wide text-muted-foreground uppercase ring-1 ring-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8 space-y-3">
              {beat.licenses.length > 0 ? (
                <Select
                  value={licenseId}
                  onChange={(e) => setLicenseId(e.target.value)}
                  aria-label="Choose a license"
                >
                  {beat.licenses.map((license) => (
                    <option key={license.id} value={license.id}>
                      {license.name} — {formatPrice(license.price)}
                    </option>
                  ))}
                </Select>
              ) : null}
              <Button
                variant="whatsapp"
                size="lg"
                block
                disabled={!settings?.whatsapp_number}
                onClick={handlePurchase}
              >
                {settings?.whatsapp_number
                  ? "Inquire on WhatsApp"
                  : "Contact currently unavailable"}
              </Button>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              You might also like
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((b) => {
                const rs = stats.data?.[b.id];
                return rs ? (
                  <BeatCard key={b.id} beat={b} stats={rs} />
                ) : (
                  <BeatCard key={b.id} beat={b} />
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mt-20 border-t border-border pt-12">
          <Comments beatId={beat.id} />
        </section>
      </div>
    </SiteLayout>
  );
}
