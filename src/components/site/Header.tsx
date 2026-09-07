import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCartIds } from "@/lib/cart";
import { useSettings } from "@/lib/settings";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/beats", label: "Beats" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, profile } = useAuth();
  const { data: settings } = useSettings();
  const { data: cartIds } = useCartIds();
  const cartCount = cartIds?.length ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="font-display text-xl font-semibold tracking-tighter uppercase">
          {settings?.producer_name ?? "Dany Beats"}
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAdmin ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin">Administration</Link>
            </Button>
          ) : null}
          {user ? (
            <>
              <Button asChild variant="surface" size="sm">
                <Link to="/profile">{profile?.display_name ?? "Mon compte"}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="relative">
                <Link to="/cart" aria-label="Voir le panier">
                  <ShoppingCart />
                  Panier
                  {cartCount > 0 ? (
                    <span className="ml-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Connexion</Link>
            </Button>
          )}
        </div>

        <button
          className="grid size-9 place-items-center rounded-full ring-1 ring-border md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                Administration
              </Link>
            ) : null}
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  Mon compte
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  Panier
                  {cartCount > 0 ? (
                    <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
