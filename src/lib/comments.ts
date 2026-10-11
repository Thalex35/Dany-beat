import { supabase } from "@/integrations/supabase/client";

export type Comment = {
  id: string;
  beat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: { display_name: string | null; avatar_url: string | null } | null;
};

// `comments.user_id` and `profiles.id` both reference `auth.users(id)` independently —
// there is no direct foreign key between `comments` and `profiles`, so PostgREST can't
// auto-embed one from the other. We fetch comments and their authors' profiles
// separately and merge them client-side instead.
const COMMENT_COLUMNS = "id, beat_id, user_id, content, created_at, updated_at";

export function commentsQuery(beatId: string) {
  return {
    queryKey: ["comments", beatId],
    queryFn: async (): Promise<Comment[]> => {
      const { data: rows, error } = await supabase
        .from("comments")
        .select(COMMENT_COLUMNS)
        .eq("beat_id", beatId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
      const profilesById = new Map<
        string,
        { display_name: string | null; avatar_url: string | null }
      >();
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);
        if (profilesError) throw profilesError;
        for (const p of profiles ?? []) {
          profilesById.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url });
        }
      }

      return (rows ?? []).map((row) => ({
        ...row,
        author: profilesById.get(row.user_id) ?? null,
      }));
    },
  };
}

export async function createComment(beatId: string, userId: string, content: string) {
  const { error } = await supabase
    .from("comments")
    .insert({ beat_id: beatId, user_id: userId, content: content.trim() });
  if (error) throw error;
}

export async function updateComment(commentId: string, content: string) {
  const { error } = await supabase
    .from("comments")
    .update({ content: content.trim() })
    .eq("id", commentId);
  if (error) throw error;
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}
