import type { Query, QueryFunctionContext } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const PUBLIC_CATALOGUE_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const PUBLIC_CATALOGUE_REVISION_KEY = ["public-catalogue-revision"] as const;

export function isPersistableCatalogueKey(queryKey: readonly unknown[]) {
  const [namespace, subtype] = queryKey;
  return (
    (namespace === "beats" && subtype === "published" && isDefaultCataloguePage(queryKey[2])) ||
    namespace === "beat-filter-options" ||
    namespace === PUBLIC_CATALOGUE_REVISION_KEY[0]
  );
}

function isDefaultCataloguePage(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const params = value as Record<string, unknown>;
  return (
    Object.keys(params).length === 10 &&
    params.page === 0 &&
    params.pageSize === 24 &&
    params.search === "" &&
    params.genre === "all" &&
    params.mood === "all" &&
    params.songKey === "all" &&
    params.bpmMin === null &&
    params.bpmMax === null &&
    params.priceMax === null &&
    params.sort === "newest"
  );
}

export function shouldPersistCatalogueQuery(query: Query) {
  return query.state.data !== undefined && isPersistableCatalogueKey(query.queryKey);
}

async function invalidatePublicCatalogue(client: QueryFunctionContext["client"]) {
  await Promise.all([
    client.invalidateQueries({ queryKey: ["beats"] }),
    client.invalidateQueries({ queryKey: ["beat"] }),
    client.invalidateQueries({ queryKey: ["beat-filter-options"] }),
  ]);
}

export const publicCatalogueRevisionQuery = {
  queryKey: PUBLIC_CATALOGUE_REVISION_KEY,
  staleTime: 0,
  gcTime: PUBLIC_CATALOGUE_CACHE_MAX_AGE,
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  queryFn: async ({ client }: QueryFunctionContext) => {
    const previous = client.getQueryData<string>(PUBLIC_CATALOGUE_REVISION_KEY);
    const { data, error } = await supabase.rpc("public_catalogue_revision");

    if (error) {
      return previous ?? null;
    }

    if (previous !== undefined && previous !== data) {
      await invalidatePublicCatalogue(client);
    }
    return data;
  },
};