import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, MessageCircle, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BeatCard } from "@/components/site/BeatCard";
import { Cover } from "@/components/site/Cover";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { signOut, useAuth } from "@/lib/auth";
import { BEAT_COLUMNS, beatStatsQuery, formatPrice, type Beat } from "@/lib/beats";
import { openWhatsapp } from "@/lib/contact";
import { useCartBeats, useToggleCart } from "@/lib/realtime";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Mon compte | Dany Beats" },
      {
        name: "description",
        content:
          "Gérez votre profil Dany Beats et retrouvez les instrumentales que vous avez aimées.",
      },
      { property: "og:title", content: "Mon compte | Dany Beats" },
      { property: "og:description", content: "Votre profil et vos beats favoris." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

export function CartPage() {
  const { user, profile } = useAuth();
  const { data: settings } = useSettings();
  const cart = useCartBeats();
  const toggle = useToggleCart();
  const beats = cart.data ?? [];
  const total = beats.reduce((sum, beat) => sum + Number(beat.cart_license_price ?? beat.price ?? 0), 0);

  async function checkout() {
    if (!settings?.whatsapp_number || !user || !beats.length) return;
    const { error } = await supabase.from("purchase_requests").insert(beats.map((beat) => ({
      user_id: user.id,
      email: user.email ?? "",
      beat_id: beat.id,
      beat_title: beat.title,
      price: Number(beat.cart_license_price ?? beat.price ?? 0),
    })));
    if (error) {
      toast.error("La demande n'a pas pu être enregistrée. Réessayez.");
      return;
    }
    openWhatsapp({
      phone: settings.whatsapp_number,
      text: [
        `Bonjour ${settings.producer_name}, je suis intéressé(e) par les beats suivants :`,
        ...beats.map((beat) => `- ${beat.title} - ${formatPrice(Number(beat.cart_license_price ?? beat.price ?? 0))}`),
        `Total estimé : ${formatPrice(total)}`,
        `Mon nom : ${profile?.display_name ?? user.email ?? ""}`,
      ].join("\n"),
    });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="font-display flex items-center gap-3 text-4xl font-semibold tracking-tighter">
          <ShoppingCart className="size-8" aria-hidden="true" />
          Mon panier
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Retrouvez vos beats sélectionnés et envoyez votre demande au producteur.</p>
        {cart.isPending ? (
          <div className="mt-10 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
        ) : cart.isError ? (
          <div className="mt-10"><EmptyState title="Impossible de charger le panier" description="Réessayez dans un instant. Vos articles ne sont pas supprimés." action={<Button size="sm" onClick={() => void cart.refetch()}>Réessayer</Button>} /></div>
        ) : beats.length === 0 ? (
          <div className="mt-10"><EmptyState title="Votre panier est vide" description="Ajoutez des beats depuis leur fiche pour les retrouver ici." action={<Button asChild size="sm"><Link to="/beats">Voir le catalogue</Link></Button>} /></div>
        ) : (
          <div className="mt-10">
            <ul className="divide-y divide-border rounded-2xl ring-1 ring-border">
              {beats.map((beat) => <li key={beat.id} className="flex items-center gap-4 p-4 sm:p-5"><Cover path={beat.cover_path} alt={`Pochette de ${beat.title}`} className="size-16 shrink-0 rounded-xl" /><div className="min-w-0 flex-1"><Link to="/beats/$slug" params={{ slug: beat.slug }} className="block truncate text-sm font-medium hover:text-primary">{beat.title}</Link><p className="mt-0.5 text-xs text-muted-foreground">{[beat.genre, beat.mood].filter(Boolean).join(" • ") || "Instrumentale"}</p>{beat.cart_license_name ? <p className="mt-1 text-xs text-primary">{beat.cart_license_name}</p> : null}</div><span className="font-display shrink-0 font-medium text-primary">{formatPrice(beat.cart_license_price ?? beat.price)}</span><button type="button" aria-label={`Retirer ${beat.title} du panier`} disabled={toggle.isPending} onClick={() => toggle.mutate({ beatId: beat.id, inCart: true })} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-destructive disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" /></button></li>)}
            </ul>
            <div className="mt-6 flex items-center justify-between rounded-2xl p-5 ring-1 ring-border"><span className="text-sm text-muted-foreground">Total estimé</span><span className="font-display text-xl font-medium text-primary">{formatPrice(total)}</span></div>
            <div className="mt-8 rounded-3xl p-6 ring-1 ring-border"><p className="text-sm text-muted-foreground">Votre message sera prérempli dans WhatsApp. Il ne vous restera qu'à appuyer sur envoyer.</p><Button variant="whatsapp" size="lg" className="mt-5" disabled={!settings?.whatsapp_number} onClick={() => void checkout()}><MessageCircle />Demander l'achat par WhatsApp</Button></div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function ProfilePage() {
  const [view, setView] = useState<"profile" | "cart">(() =>
    typeof window !== "undefined" && window.location.hash === "#cart" ? "cart" : "profile",
  );

  useEffect(() => {
    const updateView = () => setView(window.location.hash === "#cart" ? "cart" : "profile");
    window.addEventListener("hashchange", updateView);
    return () => window.removeEventListener("hashchange", updateView);
  }, []);

  if (view === "cart") return <CartPage />;
  return <ProfileView />;
}

function ProfileView() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/", replace: true });
  }

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
  }, [profile?.display_name, profile?.bio]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null, bio: bio.trim() || null })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profil mis à jour");
    },
    onError: () => toast.error("Votre profil n'a pas pu être enregistré."),
  });

  const liked = useQuery({
    queryKey: ["liked-beats", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Beat[]> => {
      const { data: likes, error } = await supabase
        .from("likes")
        .select("beat_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      const ids = (likes ?? []).map((l) => l.beat_id);
      if (!ids.length) return [];
      const { data, error: beatsError } = await supabase
        .from("beats")
        .select(BEAT_COLUMNS)
        .in("id", ids)
        .eq("status", "published");
      if (beatsError) throw beatsError;
      return (data ?? []) as unknown as Beat[];
    },
  });
  const stats = useQuery(beatStatsQuery(liked.data?.map((beat) => beat.id) ?? []));

  return (
    <SiteLayout>
      <div className="public-account-page mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="profile-hero flex flex-wrap items-start justify-between gap-4 rounded-3xl p-7 sm:p-9">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tighter">Mon compte</h1>
            <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
            <LogOut />
            Déconnexion
          </Button>
        </div>

        <form
          className="profile-form mt-8 max-w-2xl space-y-4 rounded-3xl p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Nom affiché" htmlFor="displayName">
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
            />
          </Field>
          <Field label="Biographie" htmlFor="bio">
            <Textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
            />
          </Field>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </form>

        <section id="favorites" className="profile-favorites mt-16 scroll-mt-24">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Beats favoris</h2>
          <div className="mt-8">
            {liked.isPending ? (
              <div className="grid gap-8 sm:grid-cols-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
              </div>
            ) : (liked.data ?? []).length === 0 ? (
              <EmptyState
                title="Aucun beat en favori"
                description="Touchez le cœur sur un beat pour le retrouver ici."
              />
            ) : (
              <div className="grid gap-8 sm:grid-cols-2">
                {(liked.data ?? []).map((beat) => {
                  const s = stats.data?.[beat.id];
                  return s ? (
                    <BeatCard key={beat.id} beat={beat} stats={s} queue={liked.data ?? []} />
                  ) : (
                    <BeatCard key={beat.id} beat={beat} queue={liked.data ?? []} />
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
