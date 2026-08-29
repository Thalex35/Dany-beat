import { supabase } from "@/integrations/supabase/client";
import { BEAT_COLUMNS, type Beat, type License } from "@/lib/beats";

export type AdminOverview = {
  users: number;
  active_users: number;
  published_beats: number;
  draft_beats: number;
  views: number;
  plays: number;
  likes: number;
  comments: number;
  whatsapp: number;
};

export type AdminBeatStats = {
  beat_id: string;
  title: string;
  views: number;
  plays: number;
  likes: number;
  comments: number;
  whatsapp: number;
};

export type AdminDailyEvent = { day: string; event_type: string; count: number };

export type AdminUser = {
  id: string;
  display_name: string | null;
  email: string;
  created_at: string;
  likes: number;
  comments: number;
  last_seen: string | null;
};

export const adminOverviewQuery = {
  queryKey: ["admin", "overview"],
  queryFn: async (): Promise<AdminOverview> => {
    const { data, error } = await supabase.rpc("admin_overview");
    if (error) throw error;
    return data as unknown as AdminOverview;
  },
};

export const adminBeatStatsQuery = {
  queryKey: ["admin", "beat-stats"],
  queryFn: async (): Promise<Record<string, AdminBeatStats>> => {
    const { data, error } = await supabase.rpc("admin_beat_stats");
    if (error) throw error;
    const map: Record<string, AdminBeatStats> = {};
    for (const row of (data ?? []) as AdminBeatStats[]) map[row.beat_id] = row;
    return map;
  },
};

export const adminEventsDailyQuery = {
  queryKey: ["admin", "events-daily"],
  queryFn: async (): Promise<AdminDailyEvent[]> => {
    const { data, error } = await supabase.rpc("admin_events_daily", { _days: 30 });
    if (error) throw error;
    return (data ?? []) as unknown as AdminDailyEvent[];
  },
};

export const adminUsersQuery = {
  queryKey: ["admin", "users"],
  queryFn: async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase.rpc("admin_users_overview");
    if (error) throw error;
    return (data ?? []) as unknown as AdminUser[];
  },
};

// Admins see every beat regardless of status — the "admins manage beats" /
// "published beats are public" RLS policies both resolve to full access here.
export const adminBeatsQuery = {
  queryKey: ["admin", "beats"],
  queryFn: async (): Promise<Beat[]> => {
    const { data, error } = await supabase
      .from("beats")
      .select(BEAT_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Beat[];
  },
};

export type BeatFormValues = {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string;
  mood: string;
  bpm: string;
  song_key: string;
  price: string;
  status: "draft" | "published";
  featured: boolean;
  tags: string;
  licenses: License[];
  cover_path: string | null;
  preview_path: string | null;
  master_path: string | null;
};

export function emptyBeatForm(id: string): BeatFormValues {
  return {
    id,
    title: "",
    slug: "",
    description: "",
    genre: "",
    mood: "",
    bpm: "",
    song_key: "",
    price: "0",
    status: "draft",
    featured: false,
    tags: "",
    licenses: [],
    cover_path: null,
    preview_path: null,
    master_path: null,
  };
}

export function beatToForm(beat: Beat): BeatFormValues {
  return {
    id: beat.id,
    title: beat.title,
    slug: beat.slug,
    description: beat.description ?? "",
    genre: beat.genre ?? "",
    mood: beat.mood ?? "",
    bpm: beat.bpm != null ? String(beat.bpm) : "",
    song_key: beat.song_key ?? "",
    price: String(beat.price),
    status: beat.status,
    featured: beat.featured,
    tags: beat.tags.join(", "),
    licenses: beat.licenses,
    cover_path: beat.cover_path,
    preview_path: beat.preview_path,
    master_path: beat.master_path,
  };
}

export async function saveBeat(form: BeatFormValues, isNew: boolean, userId?: string) {
  const payload = {
    id: form.id,
    title: form.title.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    genre: form.genre.trim() || null,
    mood: form.mood.trim() || null,
    bpm: form.bpm ? Number(form.bpm) : null,
    song_key: form.song_key.trim() || null,
    price: Number(form.price) || 0,
    status: form.status,
    featured: form.featured,
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    licenses: form.licenses,
    cover_path: form.cover_path,
    preview_path: form.preview_path,
    master_path: form.master_path,
    published_at: form.status === "published" ? new Date().toISOString() : null,
    created_by: userId ?? null,
  };

  if (isNew) {
    const { error } = await supabase.from("beats").insert(payload);
    if (error) throw error;
  } else {
    const { created_by: _createdBy, ...updatePayload } = payload;
    const { error } = await supabase.from("beats").update(updatePayload).eq("id", form.id);
    if (error) throw error;
  }
}

export async function deleteBeat(beatId: string) {
  const { error } = await supabase.from("beats").delete().eq("id", beatId);
  if (error) throw error;
}

const EXT_BY_KIND: Record<"cover" | "preview" | "master", string[]> = {
  cover: ["image/jpeg", "image/png", "image/webp"],
  preview: ["audio/mpeg", "audio/wav", "audio/mp3", "audio/x-wav"],
  master: ["audio/wav", "audio/x-wav", "audio/mpeg", "application/zip"],
};

const BUCKET_BY_KIND: Record<"cover" | "preview" | "master", string> = {
  cover: "covers",
  preview: "previews",
  master: "masters",
};

export async function uploadBeatAsset(
  beatId: string,
  kind: "cover" | "preview" | "master",
  file: File,
) {
  const allowed = EXT_BY_KIND[kind];
  if (!allowed.includes(file.type)) {
    throw new Error(`Unsupported file type for ${kind}: ${file.type || "unknown"}`);
  }
  const bucket = BUCKET_BY_KIND[kind];
  const ext = file.name.split(".").pop() || "bin";
  const path = `${beatId}/${kind}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

export async function updateSiteSettings(values: {
  producer_name: string;
  producer_bio: string;
  whatsapp_number: string;
  contact_email: string;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
}) {
  const { error } = await supabase
    .from("site_settings")
    .update(values)
    .eq("id", true as unknown as boolean);
  if (error) throw error;
}
