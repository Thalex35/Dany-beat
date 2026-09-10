import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Music4,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState, Spinner } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { signOut, useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Tableau de bord | Dany Beats" },
      {
        name: "description",
        content: "Espace privé du producteur pour gérer le catalogue de beats.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Tableau de bord | Dany Beats" },
      { property: "og:description", content: "Espace privé du producteur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/beats", label: "Beats", icon: Music4, exact: false },
  { to: "/admin/cart", label: "Panier", icon: ShoppingCart, exact: false },
  { to: "/admin/users", label: "Utilisateurs", icon: Users, exact: false },
  { to: "/admin/settings", label: "Paramètres", icon: Settings, exact: false },
] as const;

function ClaimAdmin() {
  const queryClient = useQueryClient();
  const adminExists = useQuery({
    queryKey: ["admin-exists"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_exists");
      if (error) throw error;
      return Boolean(data);
    },
  });

  const claim = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("claim_first_admin");
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Vous êtes désormais l'administrateur du site");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-exists"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "L'accès administrateur n'a pas pu être accordé.",
      ),
  });

  if (adminExists.isPending || adminExists.data !== false) return null;

  return (
    <div className="mt-6 rounded-2xl bg-surface p-6 text-center ring-1 ring-border">
      <p className="text-sm text-muted-foreground">
        Aucun compte producteur n'a encore été créé. Revendiquez-le une seule fois avec ce compte :
        ensuite, seuls les administrateurs existants pourront accorder ce rôle.
      </p>
      <Button className="mt-4" disabled={claim.isPending} onClick={() => claim.mutate()}>
        {claim.isPending ? "Attribution…" : "Devenir administrateur"}
      </Button>
    </div>
  );
}

function AdminLayout() {
  const { isAdmin, loading, roleLoading } = useAuth();
  const { data: settings } = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/", replace: true });
  }

  if (loading || roleLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 sm:px-8">
        <EmptyState
          title="Accès administrateur requis"
          description="Cet espace est réservé au compte du producteur."
          action={
            <Button asChild size="sm">
              <Link to="/">Retour au site</Link>
            </Button>
          }
        />
        <ClaimAdmin />
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen bg-background md:grid md:grid-cols-[16rem_1fr]">
      <aside className="border-b border-border bg-surface md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <div className="flex h-full flex-col px-5 py-6">
          <p className="font-display text-lg font-semibold tracking-tighter uppercase">
            {settings?.producer_name ?? "Dany Beats"}
          </p>
          <p className="mt-1 text-[10px] tracking-[0.25em] text-primary uppercase">
            Administration
          </p>

          <nav aria-label="Navigation administration" className="mt-8 flex flex-col gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                activeOptions={{ exact: tab.exact }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
                activeProps={{ className: "bg-background text-foreground" }}
              >
                <tab.icon className="size-4" aria-hidden="true" />
                {tab.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-1 border-t border-border pt-4 md:mt-auto">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Voir le site public
            </Link>
            <button
              onClick={() => void handleSignOut()}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
