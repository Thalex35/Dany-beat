import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { deleteComment } from "@/lib/comments";

export const Route = createFileRoute("/_authenticated/admin/comments")({
  component: AdminCommentsPage,
});

type ModerationComment = {
  id: string;
  content: string;
  created_at: string;
  beat: { title: string; slug: string } | null;
  author: { display_name: string | null } | null;
};

// `comments.beat_id` has a direct FK to `beats`, so that embed works fine via
// PostgREST. `comments.user_id` and `profiles.id` both reference `auth.users(id)`
// independently, with no direct FK between `comments` and `profiles` — so authors
// are fetched separately and merged here, same as the public comments query.
const allCommentsQuery = {
  queryKey: ["admin", "comments"],
  queryFn: async (): Promise<ModerationComment[]> => {
    const { data: rows, error } = await supabase
      .from("comments")
      .select("id, user_id, content, created_at, beat:beats(title, slug)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;

    const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
    const profilesById = new Map<string, { display_name: string | null }>();
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);
      if (profilesError) throw profilesError;
      for (const p of profiles ?? []) {
        profilesById.set(p.id, { display_name: p.display_name });
      }
    }

    return (rows ?? []).map(({ user_id, ...rest }) => ({
      ...rest,
      author: profilesById.get(user_id) ?? null,
    })) as unknown as ModerationComment[];
  },
};

function AdminCommentsPage() {
  const comments = useQuery(allCommentsQuery);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      toast.success("Comment removed");
      void queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
      void queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => toast.error("Could not remove this comment."),
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tighter">Comments</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Moderate comments left across every beat.
      </p>

      <div className="mt-8 space-y-3">
        {comments.isPending ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : comments.isError ? (
          <ErrorState
            description="Comments could not be loaded."
            onRetry={() => void comments.refetch()}
          />
        ) : comments.data.length === 0 ? (
          <EmptyState
            title="No comments yet"
            description="Comments will appear here as visitors post them."
          />
        ) : (
          comments.data.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start justify-between gap-4 rounded-2xl bg-surface p-4 ring-1 ring-border"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {comment.author?.display_name ?? "Anonymous"}
                  </span>{" "}
                  on <span className="font-medium">{comment.beat?.title ?? "Unknown beat"}</span> ·{" "}
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="destructive" className="shrink-0">
                    <Trash2 className="size-3.5" />
                  </Button>
                }
                title="Remove this comment?"
                description="This will permanently delete the comment. This cannot be undone."
                confirmLabel="Remove"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(comment.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
