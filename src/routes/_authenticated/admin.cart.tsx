import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { ErrorState, Skeleton } from "@/components/ui/states";
import { Select } from "@/components/ui/field";
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

type PurchaseRequestRow = CartRow & {
  status: "new" | "contacted" | "in_discussion" | "sold" | "cancelled";
  updated_at: string;
};

function AdminCart() {
  const queryClient = useQueryClient();
  const rows = useQuery({
    queryKey: ["admin-cart"],
    queryFn: async (): Promise<CartRow[]> => {
      const { data, error } = await supabase.rpc("admin_cart_overview");
      if (error) throw error;
      return (data ?? []) as unknown as CartRow[];
    },
  });
  const requests = useQuery({
    queryKey: ["admin-purchase-requests"],
    queryFn: async (): Promise<PurchaseRequestRow[]> => {
      const { data, error } = await supabase.rpc("admin_purchase_requests");
      if (error) throw error;
      return (data ?? []) as unknown as PurchaseRequestRow[];
    },
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PurchaseRequestRow["status"] }) => {
      const { error } = await supabase.rpc("admin_update_purchase_request_status", {
        _id: id,
        _status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-purchase-requests"] });
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

  if (requests.isError) {
    return (
      <ErrorState
        title="Les demandes sont indisponibles"
        description="La table des demandes d'achat n'est peut-être pas encore déployée."
        onRetry={() => void requests.refetch()}
      />
    );
  }

  const data = rows.data ?? [];

  return (
    <div>
      <div className="admin-page-heading mb-6">
        <div>
          <p className="eyebrow text-primary">Opportunités</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">Paniers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Contactez directement les personnes qui ont ajouté des beats à leur panier.
          </p>
        </div>
      </div>

      <div className="admin-data-panel overflow-x-auto">
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

      <div className="mt-10">
        <div className="admin-page-heading mb-6">
          <div>
            <p className="eyebrow text-primary">Suivi commercial</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">
              Demandes d'achat
            </h2>
          </div>
        </div>
        <div className="admin-data-panel overflow-x-auto">
          <table className="w-full min-w-[54rem] text-left text-sm">
            <thead className="bg-surface text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-normal">Client</th>
                <th className="px-4 py-3 font-normal">Beat</th>
                <th className="px-4 py-3 font-normal">Prix</th>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Statut</th>
              </tr>
            </thead>
            <tbody>
              {requests.isPending ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ) : (requests.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune demande d'achat enregistrée.
                  </td>
                </tr>
              ) : (
                requests.data!.map((request) => (
                  <tr key={request.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium">{request.display_name ?? "Sans nom"}</p>
                      <p className="text-xs text-muted-foreground">{request.email}</p>
                    </td>
                    <td className="px-4 py-3">{request.beat_title}</td>
                    <td className="px-4 py-3 tabular-nums text-primary">
                      {formatPrice(request.price)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={request.status}
                        onChange={(event) =>
                          updateStatus.mutate({
                            id: request.id,
                            status: event.target.value as PurchaseRequestRow["status"],
                          })
                        }
                        aria-label={`Statut de la demande pour ${request.beat_title}`}
                        className="min-w-40"
                      >
                        <option value="new">Nouveau</option>
                        <option value="contacted">Contacté</option>
                        <option value="in_discussion">En discussion</option>
                        <option value="sold">Vendu</option>
                        <option value="cancelled">Annulé</option>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
