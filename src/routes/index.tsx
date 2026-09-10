import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Headphones, Music4, Sparkles } from "lucide-react";

import { BeatCard } from "@/components/site/BeatCard";
import { HeroBackground } from "@/components/site/HeroBackground";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { beatStatsQuery, publishedBeatsQuery } from "@/lib/beats";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dany Beats — Instrumentales rap, trap & afro" },
      {
        name: "description",
        content:
          "Écoutez des instrumentales rap, trap, drill et afro originales. Prévisualisez chaque beat puis contactez directement le producteur sur WhatsApp pour l'acquérir.",
      },
      { property: "og:title", content: "Dany Beats — Instrumentales rap, trap & afro" },
      {
        property: "og:description",
        content:
          "Écoutez le catalogue d'instrumentales originales de Dany et obtenez votre licence directement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const beats = useQuery(
    publishedBeatsQuery({
      page: 0,
      pageSize: 24,
      search: "",
      genre: "all",
      mood: "all",
      sort: "newest",
    }),
  );
  const allBeats = beats.data?.beats ?? [];
  const stats = useQuery(beatStatsQuery(allBeats.map((beat) => beat.id)));
  const { data: settings } = useSettings();

  const featured = allBeats.filter((b) => b.featured).slice(0, 6);
  const list = featured.length ? featured : allBeats.slice(0, 6);
  const bioIntro = settings?.producer_bio?.split("\n").filter(Boolean)[0];

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border">
        <HeroBackground />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.3em] text-primary uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {settings?.hero_eyebrow ?? "Catalogue indépendant"}
          </p>
          <h1 className="font-display mt-6 max-w-3xl text-5xl leading-[0.95] font-semibold tracking-tighter text-balance sm:text-7xl">
            {settings?.hero_title ??
              "Des instrumentales pour les artistes qui prennent leur disque au sérieux."}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {settings?.hero_description ||
              bioIntro ||
              "Production rap, trap, drill et afro. Écoutez tout le catalogue, puis écrivez directement au producteur pour obtenir votre licence."}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/beats">
                Découvrir le catalogue
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">À propos du producteur</Link>
            </Button>
          </div>

          <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              { icon: Music4, label: "Beats en ligne", value: beats.data?.length ?? "—" },
              { icon: Headphones, label: "Écoutes gratuites", value: "Toujours" },
              { icon: Sparkles, label: "Licences", value: "En direct" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  <item.icon className="size-3.5" aria-hidden="true" />
                  {item.label}
                </dt>
                <dd className="font-display mt-2 text-2xl font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Beats à la une</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Une sélection choisie dans le catalogue du moment.
            </p>
          </div>
          <Link
            to="/beats"
            className="hidden text-xs tracking-widest text-primary uppercase hover:underline sm:block"
          >
            Tout voir
          </Link>
        </div>

        <div className="mt-10">
          {beats.isPending ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : beats.isError ? (
            <ErrorState
              title="Une erreur est survenue"
              description="Le catalogue n'a pas pu être chargé pour le moment."
              onRetry={() => void beats.refetch()}
            />
          ) : list.length === 0 ? (
            <EmptyState
              title="Aucun beat publié pour l'instant"
              description="De nouvelles instrumentales arrivent très bientôt."
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((beat) => {
                const s = stats.data?.[beat.id];
                return s ? (
                  <BeatCard key={beat.id} beat={beat} stats={s} queue={list} />
                ) : (
                  <BeatCard key={beat.id} beat={beat} queue={list} />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
