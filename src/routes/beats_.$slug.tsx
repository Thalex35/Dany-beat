import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Ear, MessageCircle, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

import { CartButton } from "@/components/site/CartButton";
import { Comments } from "@/components/site/Comments";
import { Cover } from "@/components/site/Cover";
import { LikeButton } from "@/components/site/LikeButton";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { BEAT_COLUMNS, beatStatsQuery, formatCount, formatPrice, type Beat } from "@/lib/beats";
import { usePlayer } from "@/lib/player";
import { useSignedUrl } from "@/lib/media";
import { startPurchase } from "@/lib/purchase";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/beats_/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} — instrumentale | Dany Beats`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Écoutez l'instrumentale « ${name} » : BPM, tonalité et licences disponibles, puis contactez le producteur sur WhatsApp pour l'acquérir.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Écoutez l'instrumentale « ${name} » et obtenez votre licence directement auprès du producteur.`,
        },
        { property: "og:type", content: "music.song" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BeatDetailPage,
});

function BeatDetailPage() {
  const { slug } = Route.useParams();
  const { profile } = useAuth();
  const { data: settings } = useSettings();
  const { current, playing, toggle } = usePlayer();
  const [licenseIndex, setLicenseIndex] = useState(0);

  const beatQuery = useQuery({
    queryKey: ["beat", slug],
    queryFn: async (): Promise<Beat | null> => {
      const { data, error } = await supabase
        .from("beats")
        .select(BEAT_COLUMNS)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Beat | null) ?? null;
    },
  });
  const stats = useQuery(beatStatsQuery(beatQuery.data?.id ? [beatQuery.data.id] : []));
  const beat = beatQuery.data ?? null;
  const previewUrl = useSignedUrl("previews", beat?.preview_path).data;

  useEffect(() => {
    if (beat) void track("beat_view", { beatId: beat.id, once: true });
  }, [beat]);

  if (beatQuery.isPending) {
    return (
      <SiteLayout>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,420px)_1fr]">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (beatQuery.isError) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <ErrorState
            title="Une erreur est survenue"
            description="Ce beat n'a pas pu être chargé."
            onRetry={() => void beatQuery.refetch()}
          />
        </div>
      </SiteLayout>
    );
  }

  if (!beat) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <EmptyState
            title="Beat introuvable"
            description="Cette instrumentale n'est peut-être plus publiée."
            action={
              <Button asChild size="sm">
                <Link to="/beats">Retour au catalogue</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  const s = stats.data?.[beat.id];
  const licenses = Array.isArray(beat.licenses) ? beat.licenses : [];
  const selected = licenses[licenseIndex];
  const isCurrent = current?.id === beat.id;
  const isPlaying = isCurrent && playing;
  const whatsappReady = !!settings?.whatsapp_number?.replace(/\D/g, "");

  const facts = [
    { label: "BPM", value: beat.bpm ? String(beat.bpm) : "—" },
    { label: "Tonalité", value: beat.song_key ?? "—" },
    { label: "Genre", value: beat.genre ?? "—" },
    { label: "Ambiance", value: beat.mood ?? "—" },
  ];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          to="/beats"
          className="inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Catalogue
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <div>
            <Cover
              path={beat.cover_path}
              alt={`Pochette de ${beat.title}`}
              className="aspect-square w-full rounded-3xl ring-1 ring-border"
              sizes="(min-width: 1024px) 420px, 100vw"
            />
            <div className="mt-5 flex items-center gap-4">
              <Button
                size="lg"
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
              >
                {isPlaying ? <Pause /> : <Play />}
                {isPlaying ? "Mettre en pause" : "Écouter l'extrait"}
              </Button>
              {s ? (
                <LikeButton beatId={beat.id} count={s.likes} />
              ) : (
                <LikeButton beatId={beat.id} />
              )}
              <CartButton
                beatId={beat.id}
                licenseId={selected?.id}
                licenseName={selected?.name}
                licensePrice={selected?.price}
              />
              {previewUrl ? (
                <Button asChild variant="outline" size="lg">
                  <a href={previewUrl} download={`${beat.slug}-preview.mp3`}>
                    <Download />
                    Télécharger
                  </a>
                </Button>
              ) : null}
              <span
                className="inline-flex items-center gap-1 text-[10px] tracking-widest text-muted-foreground uppercase"
                title={`${formatCount(s?.plays)} écoutes`}
              >
                <Ear className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{formatCount(s?.plays)} écoutes</span>
                <span aria-hidden="true">{formatCount(s?.plays)}</span>
              </span>
            </div>
          </div>

          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tighter sm:text-5xl">
              {beat.title}
            </h1>
            <p className="mt-3 font-display text-2xl text-primary">{formatPrice(beat.price)}</p>

            {beat.description ? (
              <p className="mt-6 max-w-xl leading-relaxed whitespace-pre-line text-muted-foreground">
                {beat.description}
              </p>
            ) : null}

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="bg-background px-4 py-4">
                  <dt className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    {f.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>

            {beat.tags?.length ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {beat.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-surface px-3 py-1 text-[11px] text-muted-foreground ring-1 ring-border"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : null}

            {licenses.length ? (
              <fieldset className="mt-10">
                <legend className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                  Choisissez une licence
                </legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {licenses.map((license, i) => (
                    <label
                      key={license.id ?? license.name ?? i}
                      className={`cursor-pointer rounded-2xl p-4 ring-1 transition-colors ${
                        licenseIndex === i
                          ? "bg-surface ring-primary"
                          : "bg-surface/50 ring-border hover:bg-surface"
                      }`}
                    >
                      <input
                        type="radio"
                        name="license"
                        className="sr-only"
                        checked={licenseIndex === i}
                        onChange={() => setLicenseIndex(i)}
                      />
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{license.name}</span>
                        <span className="font-display text-primary">
                          {formatPrice(license.price)}
                        </span>
                      </span>
                      {license.files ? (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {license.files}
                        </span>
                      ) : null}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="mt-10 rounded-3xl bg-surface p-6 ring-1 ring-border">
              <p className="text-sm text-muted-foreground">
                L'achat se fait directement avec le producteur. Envoyez votre demande et vous
                recevrez aussitôt les détails de la licence, les stems et les moyens de paiement.
              </p>
              <Button
                variant="whatsapp"
                size="lg"
                block
                className="mt-5"
                disabled={!whatsappReady}
                onClick={() =>
                  void startPurchase({
                    beatId: beat.id,
                    beatTitle: beat.title,
                    licenseName: selected?.name ?? null,
                    price: selected?.price ?? beat.price,
                    producerName: settings?.producer_name ?? "Dany Beats",
                    buyerName: profile?.display_name ?? null,
                    whatsappNumber: settings?.whatsapp_number ?? "",
                  })
                }
              >
                <MessageCircle />
                {whatsappReady ? "Acheter via WhatsApp" : "WhatsApp non configuré"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl">
          <Comments beatId={beat.id} />
        </div>
      </div>
    </SiteLayout>
  );
}
