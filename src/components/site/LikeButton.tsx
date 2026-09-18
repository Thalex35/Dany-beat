import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { formatCount } from "@/lib/beats";
import { safeAuthRedirect } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function LikeButton({
  beatId,
  count,
  className,
}: {
  beatId: string;
  count?: number | undefined;
  className?: string | undefined;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: liked = false } = useQuery({
    queryKey: ["like", beatId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("beat_id", beatId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (nextLiked: boolean) => {
      if (!user) throw new Error("auth");
      if (nextLiked) {
        const { error } = await supabase
          .from("likes")
          .insert({ beat_id: beatId, user_id: user.id });
        if (error && error.code !== "23505") throw error;
        void track("beat_like", { beatId });
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("beat_id", beatId)
          .eq("user_id", user.id);
        if (error) throw error;
        void track("beat_unlike", { beatId });
      }
      return nextLiked;
    },
    onMutate: async (nextLiked) => {
      await queryClient.cancelQueries({ queryKey: ["like", beatId, user?.id] });
      const previous = queryClient.getQueryData(["like", beatId, user?.id]);
      const previousStats = queryClient.getQueriesData<Record<string, { likes: number }>>({
        queryKey: ["beat-stats"],
      });

      queryClient.setQueryData(["like", beatId, user?.id], nextLiked);

      for (const [queryKey, stats] of previousStats) {
        if (!stats?.[beatId]) continue;
        queryClient.setQueryData(queryKey, {
          ...stats,
          [beatId]: {
            ...stats[beatId],
            likes: Math.max(0, stats[beatId].likes + (nextLiked ? 1 : -1)),
          },
        });
      }

      return { previous, previousStats };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(["like", beatId, user?.id], context?.previous);
      for (const [queryKey, stats] of context?.previousStats ?? []) {
        queryClient.setQueryData(queryKey, stats);
      }
      toast.error("Votre favori n'a pas pu être enregistré. Réessayez.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["like", beatId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["beat-stats"] });
      queryClient.invalidateQueries({ queryKey: ["liked-beats"] });
    },
  });

  const optimisticLiked = mutation.isPending ? mutation.variables : liked;
  const optimisticCount = (count ?? 0) + (optimisticLiked === liked ? 0 : optimisticLiked ? 1 : -1);

  return (
    <button
      type="button"
      aria-pressed={optimisticLiked}
      aria-label={optimisticLiked ? "Retirer ce beat des favoris" : "Ajouter ce beat aux favoris"}
      onClick={() => {
        if (!user) {
          toast("Connectez-vous pour ajouter des beats en favoris");
          navigate({
            to: "/auth",
            search: { redirect: safeAuthRedirect(window.location.pathname) },
          });
          return;
        }
        mutation.mutate(!liked);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground transition-colors hover:text-foreground",
        optimisticLiked && "text-primary hover:text-primary",
        className,
      )}
    >
      <Heart className={cn("size-4", optimisticLiked && "fill-current")} aria-hidden="true" />
      <span className="tabular-nums">{formatCount(optimisticCount)}</span>
    </button>
  );
}
