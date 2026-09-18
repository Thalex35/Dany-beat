import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { BEAT_COLUMNS, type Beat } from "@/lib/beats";

export type CartBeat = Beat & { cart_license_name: string | null; cart_license_price: number | null };

function hasMissingLicenseColumns(error: { code?: string; message?: string } | null) {
  return !!error &&
    (error.code === "PGRST204" || error.code === "42703" ||
      /license_(id|name|price)|column .* does not exist/i.test(error.message ?? ""));
}

export function useCartIds() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["cart-ids", user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await supabase.from("cart_items").select("beat_id").eq("user_id", user!.id);
    if (error) throw error;
    return (data ?? []).map((row) => row.beat_id);
  } });
}

export function useCartBeats() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["cart-beats", user?.id], enabled: !!user, queryFn: async (): Promise<CartBeat[]> => {
    let { data: items, error } = await supabase.from("cart_items").select("beat_id, license_name, license_price").eq("user_id", user!.id).order("created_at", { ascending: false });
    if (hasMissingLicenseColumns(error)) {
      const fallback = await supabase.from("cart_items").select("beat_id").eq("user_id", user!.id).order("created_at", { ascending: false });
      items = (fallback.data ?? []).map((item) => ({ ...item, license_name: null, license_price: null }));
      error = fallback.error;
    }
    if (error) throw error;
    const ids = (items ?? []).map((item) => item.beat_id);
    if (!ids.length) return [];
    const { data, error: beatError } = await supabase.from("beats").select(BEAT_COLUMNS).in("id", ids);
    if (beatError) throw beatError;
    const beats = (data ?? []) as unknown as Beat[];
    return ids.map((id) => beats.find((beat) => beat.id === id)).filter((beat): beat is Beat => !!beat).map((beat) => {
      const item = (items ?? []).find((candidate) => candidate.beat_id === beat.id);
      return { ...beat, cart_license_name: item?.license_name ?? null, cart_license_price: item?.license_price ?? null };
    });
  } });
}

export function useToggleCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async ({ beatId, inCart, licenseId, licenseName, licensePrice }: { beatId: string; inCart: boolean; licenseId?: string | null; licenseName?: string | null; licensePrice?: number | null }) => {
    if (!user) throw new Error("auth");
    if (inCart) {
      const { error } = await supabase.from("cart_items").delete().eq("beat_id", beatId).eq("user_id", user.id);
      if (error) throw error;
      void track("cart_remove", { beatId });
    } else {
      let { error } = await supabase.from("cart_items").insert({ beat_id: beatId, user_id: user.id, license_id: licenseId ?? null, license_name: licenseName ?? null, license_price: licensePrice ?? null });
      if (hasMissingLicenseColumns(error)) {
        const fallback = await supabase.from("cart_items").insert({ beat_id: beatId, user_id: user.id });
        error = fallback.error;
      }
      if (error && error.code !== "23505") throw error;
      void track("cart_add", { beatId });
    }
  }, onError: () => toast.error("Le panier n'a pas pu être mis à jour. Réessayez."), onSettled: () => {
    void queryClient.invalidateQueries({ queryKey: ["cart-ids", user?.id] });
    void queryClient.invalidateQueries({ queryKey: ["cart-beats", user?.id] });
  } });
}

const invalidatedQueryKeys: Record<string, readonly (readonly unknown[])[]> = {
  beats: [["beats"], ["beat-filter-options"], ["beat"]],
  comments: [["comments"], ["beat-stats"], ["admin-overview"], ["admin-beat-stats"]],
  likes: [["like"], ["liked-beats"], ["beat-stats"], ["admin-overview"], ["admin-beat-stats"]],
  cart_items: [["cart-ids"], ["cart-beats"], ["admin-cart"], ["admin-overview"]],
  analytics_events: [["beat-stats"], ["admin-overview"], ["admin-beat-stats"]],
  site_settings: [["site-settings"]],
  profiles: [["me"], ["admin-users"]],
  user_roles: [["me"], ["admin-users"], ["admin-exists"]],
};

export function useRealtimeSync(queryClient: QueryClient) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const channel = supabase
      .channel("app-live-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "beats" }, () =>
        invalidateForTable(queryClient, "beats"),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () =>
        invalidateForTable(queryClient, "comments"),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () =>
        invalidateForTable(queryClient, "likes"),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, () =>
        invalidateForTable(queryClient, "cart_items"),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "analytics_events" }, () =>
        invalidateForTable(queryClient, "analytics_events"),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () =>
        invalidateForTable(queryClient, "site_settings"),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () =>
        invalidateForTable(queryClient, "profiles"),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () =>
        invalidateForTable(queryClient, "user_roles"),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

function invalidateForTable(queryClient: QueryClient, table: string) {
  for (const queryKey of invalidatedQueryKeys[table] ?? []) {
    void queryClient.invalidateQueries({ queryKey: [...queryKey] });
  }
}
