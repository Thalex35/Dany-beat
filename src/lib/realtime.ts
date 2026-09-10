import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

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
