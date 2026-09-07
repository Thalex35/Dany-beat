import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle, ShoppingCart, Trash2 } from "lucide-react";

import { Cover } from "@/components/site/Cover";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/beats";
import { useCartBeats, useToggleCart } from "@/lib/cart";
import { openEmail, openWhatsapp } from "@/lib/contact";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({
    meta: [{ title: "Mon panier | Dany Beats" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: CartPage,
});

function buildCartMessage(params: {
  buyerName: string;
  beats: { title: string; price: number }[];
  total: number;
  producerName: string;
}) {
  const lines = [
    `Bonjour ${params.producerName}, je suis intéressé(e) par les beats suivants dans mon panier :`,
    "",
    ...params.beats.map((b) => `• ${b.title} — ${formatPrice(b.price)}`),
    "",
    `Total estimé : ${formatPrice(params.total)}`,
    "",
    `Mon nom : ${params.buyerName}`,
    "J'aimerais connaître les licences disponibles et les moyens de paiement.",
  ];
  return lines.join("\n");
}

function CartPage() {
  const { profile, user } = useAuth();
  const { data: settings } = useSettings();
  const beats = useCartBeats();
  const toggle = useToggleCart();

  const list = beats.data ?? [];
  const total = list.reduce((sum, b) => sum + Number(b.price ?? 0), 0);
  const whatsappReady = !!settings?.whatsapp_number?.replace(/\D/g, "");
  const emailReady = !!settings?.contact_email;
  const buyerName = profile?.display_name ?? user?.email ?? "Un visiteur";

  function handleEmail() {
    if (!settings?.contact_email) return;
    openEmail({
      to: settings.contact_email,
      subject: `Panier de ${buyerName} — ${list.length} beat(s)`,
      body: buildCartMessage({
        buyerName,
        beats: list,
        total,
        producerName: settings?.producer_name ?? "le producteur",
      }),
    });
  }

  function handleWhatsapp() {
    if (!settings?.whatsapp_number) return;
    openWhatsapp({
      phone: settings.whatsapp_number,
      text: buildCartMessage({
        buyerName,
        beats: list,
        total,
        producerName: settings?.producer_name ?? "le producteur",
      }),
    });
  }

  return (
    <SiteLayout>
      <div className="public-account-page mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <header className="public-page-heading">
          <h1 className="font-display flex items-center gap-3 text-4xl font-semibold tracking-tighter">
            <ShoppingCart className="size-8" aria-hidden="true" />
            Mon panier
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Vos sélections sont conservées ici, prêtes pour votre prochaine session studio.
          </p>
        </header>

        <div className="mt-10">
          {beats.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : beats.isError ? (
            <ErrorState
              title="Une erreur est survenue"
              description="Votre panier n'a pas pu être chargé."
              onRetry={() => void beats.refetch()}
            />
          ) : list.length === 0 ? (
            <EmptyState
              title="Votre panier est vide"
              description="Ajoutez des beats depuis le catalogue pour les retrouver ici."
              action={
                <Button asChild size="sm">
                  <Link to="/beats">Voir le catalogue</Link>
                </Button>
              }
            />
          ) : (
            <>
              <ul className="premium-list divide-y divide-border rounded-2xl ring-1 ring-border">
                {list.map((beat) => (
                  <li key={beat.id} className="flex items-center gap-4 p-4">
                    <Cover
                      path={beat.cover_path}
                      alt={`Pochette de ${beat.title}`}
                      className="size-16 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/beats/$slug"
                        params={{ slug: beat.slug }}
                        className="truncate text-sm font-medium hover:text-primary"
                      >
                        {beat.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[beat.genre, beat.mood].filter(Boolean).join(" • ") || "Instrumentale"}
                      </p>
                    </div>
                    <span className="font-display shrink-0 font-medium text-primary">
                      {formatPrice(beat.price)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Retirer ${beat.title} du panier`}
                      disabled={toggle.isPending}
                      onClick={() => toggle.mutate({ beatId: beat.id, inCart: true })}
                      className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="premium-total mt-6 flex items-center justify-between rounded-2xl p-5 ring-1 ring-border">
                <span className="text-sm text-muted-foreground">Total estimé</span>
                <span className="font-display text-xl font-medium text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="premium-checkout mt-8 rounded-3xl p-6 ring-1 ring-border">
                <p className="text-sm text-muted-foreground">
                  Envoyez le contenu de votre panier au producteur pour finaliser votre commande.
                  Votre message sera prérempli, il ne vous restera qu'à appuyer sur envoyer.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    disabled={!emailReady}
                    onClick={handleEmail}
                    title={emailReady ? undefined : "E-mail non configuré"}
                  >
                    <Mail />
                    Envoyer par e-mail
                  </Button>
                  <Button
                    variant="whatsapp"
                    size="lg"
                    disabled={!whatsappReady}
                    onClick={handleWhatsapp}
                    title={whatsappReady ? undefined : "WhatsApp non configuré"}
                  >
                    <MessageCircle />
                    Envoyer par WhatsApp
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
