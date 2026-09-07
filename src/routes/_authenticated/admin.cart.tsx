import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/beats";

export const Route = createFileRoute("/_authenticated/admin/cart")({
  component: AdminCart,
});

type CartRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  beat_id: string;
  beat_title: string;
  beat_slug: string;
  price: number;
  created_at: string;
};

function AdminCart() {
  const rows = useQuery({
    queryKey: ["admin-cart"],
    queryFn: async (): Promise<CartRow[]> => {
      const { data, error } = await supabase.rpc("admin_cart_overview");
      if (error) throw error;
      return (data ?? []) as unknown as CartRow[];
    },
  });

  if (rows.isError) {
    return (
      <ErrorState
        title="Une erreur est survenue"
        description="Le contenu des paniers n'a pas pu être chargé."
        onRetry={() => void rows.refetch()}
      />
    );
  }

  const data = rows.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
            Paniers des clients
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Contactez directement les personnes qui ont ajouté des beats à leur panier.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-border">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="bg-surface text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Client</th>
              <th className="px-4 py-3 font-normal">Beat</th>
              <th className="px-4 py-3 font-normal">Prix</th>
              <th className="px-4 py-3 font-normal">Ajouté le</th>
              <th className="px-4 py-3 font-normal">Contact</th>
            </tr>
          </thead>
          <tbody>
            {rows.isPending ? (
              <tr>
                <td colSpan={5} className="px-4 py-6">
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun beat n'a encore été ajouté à un panier.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.display_name ?? "Sans nom"}</p>
                    <p className="text-xs text-muted-foreground">{row.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">{row.beat_title}</td>
                  <td className="px-4 py-3 tabular-nums text-primary">{formatPrice(row.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    {row.email ? (
                      <a
                        href={`mailto:${row.email}?subject=${encodeURIComponent(
                          `À propos de "${row.beat_title}"`,
                        )}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <Mail className="size-3.5" aria-hidden="true" />
                        Contacter
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
