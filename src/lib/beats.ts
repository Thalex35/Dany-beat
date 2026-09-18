import { supabase } from "@/integrations/supabase/client";

export type License = { id: string; name: string; price: number; files: string; terms?: string };

export type Beat = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  mood: string | null;
  bpm: number | null;
  song_key: string | null;
  price: number;
  licenses: License[];
  tags: string[];
  cover_path: string | null;
  preview_path: string | null;
  master_path: string | null;
  status: "draft" | "published";
  featured: boolean;
  created_at: string;
  published_at: string | null;
};

export type BeatStats = {
  beat_id: string;
  likes: number;
  comments: number;
  plays: number;
  views: number;
};

export type PublishedBeatsPage = {
  beats: Beat[];
  total: number;
};

export type BeatFilterOptions = {
  genre: string | null;
  mood: string | null;
  song_key: string | null;
};

export const BEAT_COLUMNS =
  "id, title, slug, description, genre, mood, bpm, song_key, price, licenses, tags, cover_path, preview_path, master_path, status, featured, created_at, published_at";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const publishedBeatsQuery = (params: {
  page: number;
  pageSize: number;
  search: string;
  genre: string;
  mood: string;
  songKey: string;
  bpmMin: number | null;
  bpmMax: number | null;
  priceMax: number | null;
  sort: "newest" | "oldest" | "price-asc" | "price-desc" | "popular";
}) => ({
  queryKey: ["beats", "published", params],
  queryFn: async (): Promise<PublishedBeatsPage> => {
    const from = params.page * params.pageSize;
    const to = from + params.pageSize - 1;
    let query = supabase
      .from("beats")
      .select(BEAT_COLUMNS, { count: "exact" })
      .eq("status", "published");

    if (params.search.trim()) {
      const search = params.search.trim().replace(/[%,()]/g, " ");
      query = query.or(
        `title.ilike.%${search}%,genre.ilike.%${search}%,mood.ilike.%${search}%,song_key.ilike.%${search}%,tags.cs.{${search}}`,
      );
    }
    if (params.genre !== "all") query = query.eq("genre", params.genre);
    if (params.mood !== "all") query = query.eq("mood", params.mood);
    if (params.songKey !== "all") query = query.eq("song_key", params.songKey);
    if (params.bpmMin !== null) query = query.gte("bpm", params.bpmMin);
    if (params.bpmMax !== null) query = query.lte("bpm", params.bpmMax);
    if (params.priceMax !== null) query = query.lte("price", params.priceMax);

    if (params.sort === "price-asc") query = query.order("price", { ascending: true });
    else if (params.sort === "price-desc") query = query.order("price", { ascending: false });
    else {
      query = query.order("published_at", {
        ascending: params.sort === "oldest",
        nullsFirst: false,
      });
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;
    return { beats: (data ?? []) as unknown as Beat[], total: count ?? 0 };
  },
});

export const beatFilterOptionsQuery = {
  queryKey: ["beat-filter-options"],
  staleTime: 300_000,
  queryFn: async (): Promise<BeatFilterOptions[]> => {
    const { data, error } = await supabase
      .from("beats")
      .select("genre, mood, song_key")
      .eq("status", "published");
    if (error) throw error;
    return (data ?? []) as BeatFilterOptions[];
  },
};

export const beatStatsQuery = (beatIds?: string[]) => ({
  queryKey: ["beat-stats", beatIds ?? "all"],
  staleTime: 30_000,
  queryFn: async (): Promise<Record<string, BeatStats>> => {
    const { data, error } = await supabase.rpc("beat_public_stats", {
      _beat_ids: beatIds === undefined ? null : beatIds,
    });
    if (error) throw error;
    const map: Record<string, BeatStats> = {};
    for (const row of (data ?? []) as BeatStats[]) map[row.beat_id] = row;
    return map;
  },
});

export function formatPrice(value: number | null | undefined) {
  if (value == null) return "—";
  return `$${Number(value).toFixed(2)}`;
}

export function formatCount(value: number | undefined) {
  const n = value ?? 0;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
