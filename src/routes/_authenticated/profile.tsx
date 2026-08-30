import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BeatCard } from "@/components/site/BeatCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Field, Textarea, Input } from "@/components/ui/field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { signOut, useAuth } from "@/lib/auth";
import { beatStatsQuery, likedBeatsQuery } from "@/lib/beats";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "My Account | Dany Beats" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const liked = useQuery({ ...likedBeatsQuery(user?.id ?? ""), enabled: !!user });
  const stats = useQuery(beatStatsQuery);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
  }, [profile?.display_name, profile?.bio]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null, bio: bio.trim() || null })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Could not update your profile. Please try again."),
  });

  if (!user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <Skeleton className="h-10 w-1/3" />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tighter">My account</h1>

        <section className="mt-10 rounded-3xl bg-surface p-6 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void signOut()}>
            Sign out
          </Button>
        </section>

        <section className="mt-6 rounded-3xl bg-surface p-6 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <Field label="Display name" htmlFor="displayName">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
              />
            </Field>
            <Field label="Bio" htmlFor="bio">
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Optional — tell us a bit about yourself"
              />
            </Field>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Liked beats</h2>
          <div className="mt-6">
            {liked.isPending ? (
              <div className="grid gap-8 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : liked.isError ? (
              <ErrorState
                description="Your liked beats could not be loaded."
                onRetry={() => void liked.refetch()}
              />
            ) : liked.data.length === 0 ? (
              <EmptyState
                title="No liked beats yet"
                description="Beats you like will show up here."
              />
            ) : (
              <div className="grid gap-8 sm:grid-cols-2">
                {liked.data.map((beat) => {
                  const s = stats.data?.[beat.id];
                  return s ? (
                    <BeatCard key={beat.id} beat={beat} stats={s} />
                  ) : (
                    <BeatCard key={beat.id} beat={beat} />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
