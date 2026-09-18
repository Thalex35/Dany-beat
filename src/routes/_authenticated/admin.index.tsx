import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { formatCount } from "@/lib/beats";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

type Overview = {
  users: number;
  active_users: number;
  published_beats: number;
  draft_beats: number;
  views: number;
  plays: number;
  likes: number;
  comments: number;
  whatsapp: number;
  cart_items: number;
};

type BeatStatRow = {
  beat_id: string;
  title: string;
  views: number;
  plays: number;
  likes: number;
  comments: number;
  whatsapp: number;
};

function AdminOverview() {
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async (): Promise<Overview> => {
      const { data, error } = await supabase.rpc("admin_overview");
      if (error) throw error;
      return data as unknown as Overview;
    },
  });

  const perBeat = useQuery({
    queryKey: ["admin-beat-stats"],
    queryFn: async (): Promise<BeatStatRow[]> => {
      const { data, error } = await supabase.rpc("admin_beat_stats");
      if (error) throw error;
      return (data ?? []) as unknown as BeatStatRow[];
    },
  });

  if (overview.isError) {
    return (
      <ErrorState
        title="Une erreur est survenue"
        description="Les statistiques du tableau de bord n'ont pas pu être chargées."
        onRetry={() => void overview.refetch()}
      />
    );
  }

  const cards = [
    { label: "Beats publiés", value: overview.data?.published_beats },
    { label: "Brouillons", value: overview.data?.draft_beats },
    { label: "Utilisateurs inscrits", value: overview.data?.users },
    { label: "Actifs (30 j)", value: overview.data?.active_users },
    { label: "Pages vues", value: overview.data?.views },
    { label: "Écoutes", value: overview.data?.plays },
    { label: "Favoris", value: overview.data?.likes },
    { label: "Demandes WhatsApp", value: overview.data?.whatsapp },
    { label: "Beats en panier", value: overview.data?.cart_items },
  ];

  const top = [...(perBeat.data ?? [])].sort((a, b) => b.plays - a.plays).slice(0, 8);

  return (
    <div className="admin-dashboard space-y-12">
      <section className="admin-welcome rounded-3xl p-7 sm:p-9">
        <p className="eyebrow text-primary">Centre de contrôle</p>
        <h1 className="font-display mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Votre studio, en un regard.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Suivez l'activité du catalogue, vos auditeurs et les signaux qui méritent votre attention.
        </p>
      </section>
      <section>
        <h2 className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
          Vue d'ensemble
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => (
            <div key={card.label} className={`admin-metric-card admin-metric-card-${index % 4}`}>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {card.label}
              </p>
              {overview.isPending ? (
                <Skeleton className="mt-3 h-7 w-16" />
              ) : (
                <p className="font-display mt-2 text-3xl font-medium">
                  {formatCount(Number(card.value ?? 0))}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
          Beats les plus écoutés
        </h2>
        <div className="admin-data-panel mt-5 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-surface text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-normal">Beat</th>
                <th className="px-4 py-3 font-normal">Vues</th>
                <th className="px-4 py-3 font-normal">Écoutes</th>
                <th className="px-4 py-3 font-normal">Favoris</th>
                <th className="px-4 py-3 font-normal">Commentaires</th>
                <th className="px-4 py-3 font-normal">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {perBeat.isPending ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ) : top.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune activité enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                top.map((row) => (
                  <tr key={row.beat_id} className="border-t border-border">
                    <td className="px-4 py-3">{row.title}</td>
                    <td className="px-4 py-3 tabular-nums">{row.views}</td>
                    <td className="px-4 py-3 tabular-nums">{row.plays}</td>
                    <td className="px-4 py-3 tabular-nums">{row.likes}</td>
                    <td className="px-4 py-3 tabular-nums">{row.comments}</td>
                    <td className="px-4 py-3 tabular-nums">{row.whatsapp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
