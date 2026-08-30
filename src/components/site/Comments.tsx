import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/states";
import {
  commentsQuery,
  createComment,
  deleteComment,
  updateComment,
  type Comment,
} from "@/lib/comments";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";

const MAX_LENGTH = 1000;

export function Comments({ beatId }: { beatId: string }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const comments = useQuery(commentsQuery(beatId));

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["comments", beatId] });

  const createMutation = useMutation({
    mutationFn: (content: string) => createComment(beatId, user!.id, content),
    onSuccess: () => {
      setDraft("");
      void track("beat_comment", { beatId });
      invalidate();
    },
    onError: () => toast.error("Could not post your comment. Please try again."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateComment(id, content),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
    onError: () => toast.error("Could not update your comment."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: invalidate,
    onError: () => toast.error("Could not delete that comment."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast("Sign in to leave a comment");
      navigate({ to: "/auth", search: { redirect: window.location.pathname } });
      return;
    }
    const content = draft.trim();
    if (!content) return;
    createMutation.mutate(content);
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Comments {comments.data ? `(${comments.data.length})` : ""}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
          placeholder={user ? "Share your thoughts on this beat…" : "Sign in to leave a comment"}
          rows={3}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {draft.length}/{MAX_LENGTH}
          </span>
          <Button type="submit" size="sm" disabled={createMutation.isPending || !draft.trim()}>
            {createMutation.isPending ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </form>

      <div className="mt-8 space-y-6">
        {comments.isPending ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : comments.isError ? (
          <p className="text-sm text-muted-foreground">Comments could not be loaded.</p>
        ) : comments.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No comments yet — be the first to share your thoughts.
          </p>
        ) : (
          comments.data.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              canEdit={comment.user_id === user?.id}
              canDelete={comment.user_id === user?.id || isAdmin}
              isEditing={editingId === comment.id}
              editDraft={editDraft}
              onStartEdit={() => {
                setEditingId(comment.id);
                setEditDraft(comment.content);
              }}
              onCancelEdit={() => setEditingId(null)}
              onEditChange={setEditDraft}
              onSaveEdit={() => updateMutation.mutate({ id: comment.id, content: editDraft })}
              onDelete={() => deleteMutation.mutate(comment.id)}
              savingEdit={updateMutation.isPending}
              deleting={deleteMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  canEdit,
  canDelete,
  isEditing,
  editDraft,
  onStartEdit,
  onCancelEdit,
  onEditChange,
  onSaveEdit,
  onDelete,
  savingEdit,
  deleting,
}: {
  comment: Comment;
  canEdit: boolean;
  canDelete: boolean;
  isEditing: boolean;
  editDraft: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  savingEdit: boolean;
  deleting: boolean;
}) {
  const name = comment.author?.display_name ?? "Anonymous";

  return (
    <div className="flex gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-medium uppercase">
        {name.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </p>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editDraft}
              onChange={(e) => onEditChange(e.target.value.slice(0, MAX_LENGTH))}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSaveEdit} disabled={savingEdit || !editDraft.trim()}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
            {comment.content}
          </p>
        )}

        {(canEdit || canDelete) && !isEditing ? (
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
            {canEdit ? (
              <button onClick={onStartEdit} className="hover:text-foreground">
                Edit
              </button>
            ) : null}
            {canDelete ? (
              <button
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1 hover:text-destructive"
              >
                <Trash2 className="size-3" aria-hidden="true" />
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
