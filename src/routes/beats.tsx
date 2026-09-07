import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { BeatCard } from "@/components/site/BeatCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Input, Select } from "@/components/ui/field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { beatStatsQuery, publishedBeatsQuery } from "@/lib/beats";

export const Route = createFileRoute("/beats")({
  head: () => ({
    meta: [
      { title: "Catalogue de beats — rap, trap & afro | Dany Beats" },
      {
        name: "description",
        content:
          "Parcourez toutes les instrumentales publiées : filtrez par genre, ambiance et BPM, écoutez-les dans le player et obtenez votre licence via WhatsApp.",
      },
      { property: "og:title", content: "Catalogue de beats | Dany Beats" },
      {
        property: "og:description",
        content: "Filtrez, écoutez et licenciez les instrumentales originales de Dany Beats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BeatsPage,
});

type Sort = "newest" | "oldest" | "price-asc" | "price-desc" | "popular";

function BeatsPage() {
  const beats = useQuery(publishedBeatsQuery);
  const stats = useQuery(beatStatsQuery);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [mood, setMood] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");

  const all = beats.data ?? [];
  const genres = useMemo(
    () => Array.from(new Set(all.map((b) => b.genre).filter(Boolean) as string[])).sort(),
    [all],
  );
  const moods = useMemo(
    () => Array.from(new Set(all.map((b) => b.mood).filter(Boolean) as string[])).sort(),
    [all],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = all.filter((b) => {
      if (genre !== "all" && b.genre !== genre) return false;
      if (mood !== "all" && b.mood !== mood) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        (b.genre ?? "").toLowerCase().includes(q) ||
        (b.mood ?? "").toLowerCase().includes(q) ||
        (b.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
    const byDate = (v: string | null, fallback: string) => new Date(v ?? fallback).getTime();
    return result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return byDate(a.published_at, a.created_at) - byDate(b.published_at, b.created_at);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "popular":
          return (stats.data?.[b.id]?.plays ?? 0) - (stats.data?.[a.id]?.plays ?? 0);
        default:
          return byDate(b.published_at, b.created_at) - byDate(a.published_at, a.created_at);
      }
    });
  }, [all, search, genre, mood, sort, stats.data]);

  return (
    <SiteLayout>
      <div className="public-catalogue mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <header className="public-page-heading">
          <h1 className="font-display text-4xl font-semibold tracking-tighter sm:text-5xl">
            Catalogue de beats
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Chaque instrumentale s'écoute en qualité preview. Un coup de cœur ? Envoyez votre
            demande WhatsApp directement depuis la page du beat.
          </p>
        </header>

        <div className="public-filter-bar mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre, tag ou ambiance"
              aria-label="Rechercher un beat"
              className="pl-11"
            />
          </div>
          <Select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            aria-label="Filtrer par genre"
          >
            <option value="all">Tous les genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
          <Select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            aria-label="Filtrer par ambiance"
          >
            <option value="all">Toutes les ambiances</option>
            {moods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {beats.isPending
              ? "Chargement…"
              : `${filtered.length} beat${filtered.length === 1 ? "" : "s"}`}
          </p>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Trier les beats"
            className="w-auto"
          >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="popular">Les plus écoutés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </Select>
        </div>

        <div className="mt-10">
          {beats.isPending ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
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
              description="Le catalogue n'a pas pu être chargé."
              onRetry={() => void beats.refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Aucun beat ne correspond à ces filtres"
              description="Essayez d'effacer la recherche ou de choisir un autre genre."
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((beat) => {
                const s = stats.data?.[beat.id];
                return s ? (
                  <BeatCard key={beat.id} beat={beat} stats={s} />
                ) : (
                  <BeatCard key={beat.id} beat={beat} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
