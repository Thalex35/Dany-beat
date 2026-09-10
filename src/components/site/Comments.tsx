import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm";
import { Textarea } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { COMMENT_MAX_LENGTH, sanitizeCommentInput } from "@/lib/validation";

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  author: string;
};

export function Comments({ beatId }: { beatId: string }) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [replyValue, setReplyValue] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const comments = useQuery({
    queryKey: ["comments", beatId],
    queryFn: async (): Promise<CommentRow[]> => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, user_id, parent_id")
        .eq("beat_id", beatId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      const ids = Array.from(new Set(rows.map((r) => r.user_id)));
      let names: Record<string, string> = {};
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", ids);
        names = Object.fromEntries(
          (profiles ?? []).map((p) => [p.id, p.display_name ?? "Auditeur"]),
        );
      }
      return rows.map((r) => ({ ...r, author: names[r.user_id] ?? "Auditeur" }));
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId: string | null }) => {
      if (!user) throw new Error("auth");
      const { error } = await supabase
        .from("comments")
        .insert({ beat_id: beatId, user_id: user.id, content, parent_id: parentId });
      if (error) throw error;
      void track("beat_comment", { beatId });
    },
    onSuccess: () => {
      setValue("");
      setReplyValue("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["comments", beatId] });
      queryClient.invalidateQueries({ queryKey: ["beat-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-beat-stats"] });
      toast.success("Commentaire publié");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Votre commentaire n'a pas pu être publié.",
      ),
  });

  const removeComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", beatId] });
      queryClient.invalidateQueries({ queryKey: ["beat-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-beat-stats"] });
      toast.success("Commentaire supprimé");
    },
    onError: () => toast.error("Ce commentaire n'a pas pu être supprimé."),
  });

  return (
    <section aria-labelledby="comments-heading" className="mt-16">
      <h2 id="comments-heading" className="font-display text-2xl font-semibold tracking-tight">
        Commentaires
      </h2>

      {user ? (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            const sanitized = sanitizeCommentInput(value);
            if (!sanitized) {
              toast.error("Votre commentaire ne peut pas être vide.");
              return;
            }
            addComment.mutate({ content: sanitized, parentId: null });
          }}
        >
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            maxLength={COMMENT_MAX_LENGTH}
            aria-label="Écrire un commentaire"
            placeholder="Partagez votre avis sur ce beat…"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {value.length}/{COMMENT_MAX_LENGTH}
            </span>
            <Button type="submit" size="sm" disabled={!value.trim() || addComment.isPending}>
              {addComment.isPending ? "Publication…" : "Publier"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-6 rounded-2xl bg-surface p-4 text-sm text-muted-foreground ring-1 ring-border">
          <Link to="/auth" className="text-primary underline underline-offset-4">
            Connectez-vous
          </Link>{" "}
          pour laisser un commentaire sur ce beat.
        </p>
      )}

      <div className="mt-8 space-y-5">
        {comments.isPending ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : (comments.data ?? []).length === 0 ? (
          <EmptyState
            title="Aucun commentaire"
            description="Soyez le premier à réagir à ce beat."
          />
        ) : (
          (comments.data ?? [])
            .filter((c) => !c.parent_id)
            .map((c) => (
              <article key={c.id} className="rounded-2xl bg-surface p-4 ring-1 ring-border">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{c.author}</p>
                  <div className="flex items-center gap-3">
                    <time dateTime={c.created_at} className="text-[11px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </time>
                    {user && (user.id === c.user_id || isAdmin) ? (
                      <ConfirmDialog
                        title="Supprimer ce commentaire ?"
                        description="Cette action est irréversible."
                        confirmLabel="Supprimer"
                        onConfirm={() => removeComment.mutate(c.id)}
                        trigger={
                          <button
                            aria-label="Supprimer le commentaire"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        }
                      />
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {c.content}
                </p>
                {user ? (
                  <button
                    type="button"
                    className="mt-3 text-xs text-primary hover:underline"
                    onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  >
                    {replyTo === c.id ? "Annuler" : "Répondre"}
                  </button>
                ) : null}
                {(comments.data ?? [])
                  .filter((reply) => reply.parent_id === c.id)
                  .map((reply) => (
                    <div key={reply.id} className="mt-4 border-l-2 border-border pl-4">
                      <p className="text-sm font-medium">{reply.author}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                {replyTo === c.id ? (
                  <form
                    className="mt-4 space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const sanitized = sanitizeCommentInput(replyValue);
                      if (sanitized) addComment.mutate({ content: sanitized, parentId: c.id });
                    }}
                  >
                    <Textarea
                      value={replyValue}
                      onChange={(e) => setReplyValue(e.target.value)}
                      rows={2}
                      maxLength={COMMENT_MAX_LENGTH}
                      aria-label="Écrire une réponse"
                      placeholder="Répondre à ce commentaire…"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!replyValue.trim() || addComment.isPending}
                    >
                      Répondre
                    </Button>
                  </form>
                ) : null}
              </article>
            ))
        )}
      </div>
    </section>
  );
}
