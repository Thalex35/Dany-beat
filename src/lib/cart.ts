import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { BEAT_COLUMNS, type Beat } from "@/lib/beats";

/** Ids des beats présents dans le panier de l'utilisateur connecté (léger, pour badge + bouton). */
export function useCartIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cart-ids", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("beat_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.beat_id);
    },
  });
}

/** Contenu complet du panier (beats détaillés) pour la page /panier. */
export function useCartBeats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cart-beats", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Beat[]> => {
      const { data: items, error } = await supabase
        .from("cart_items")
        .select("beat_id")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (items ?? []).map((i) => i.beat_id);
      if (!ids.length) return [];
      const { data, error: beatsError } = await supabase
        .from("beats")
        .select(BEAT_COLUMNS)
        .in("id", ids);
      if (beatsError) throw beatsError;
      const beats = (data ?? []) as unknown as Beat[];
      // conserve l'ordre d'ajout (le plus récent en premier)
      return ids.map((id) => beats.find((b) => b.id === id)).filter((b): b is Beat => !!b);
    },
  });
}

export function useToggleCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ beatId, inCart }: { beatId: string; inCart: boolean }) => {
      if (!user) throw new Error("auth");
      if (inCart) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("beat_id", beatId)
          .eq("user_id", user.id);
        if (error) throw error;
        void track("cart_remove", { beatId });
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ beat_id: beatId, user_id: user.id });
        if (error && error.code !== "23505") throw error;
        void track("cart_add", { beatId });
      }
    },
    onError: () => toast.error("Le panier n'a pas pu être mis à jour. Réessayez."),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-ids", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["cart-beats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-cart"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}
