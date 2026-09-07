import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Header } from "@/components/site/Header";
import { PlayerBar } from "@/components/site/PlayerBar";
import { usePlayer } from "@/lib/player";
import { useSettings } from "@/lib/settings";

function Footer() {
  const { data: settings } = useSettings();
  const socials = [
    { url: settings?.instagram_url, label: "Instagram" },
    { url: settings?.youtube_url, label: "YouTube" },
    { url: settings?.tiktok_url, label: "TikTok" },
  ].filter((s) => !!s.url);

  return (
    <footer className="site-footer mt-24 px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 border-b border-border pb-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="eyebrow text-primary">Dany Beats</p>
          <p className="font-display mt-3 max-w-sm text-3xl font-semibold tracking-tight">
            Des sons qui donnent une direction à vos idées.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Instrumentales originales, licences claires et contact direct avec le producteur.
          </p>
        </div>
        <div>
          <p className="eyebrow">Navigation</p>
          <nav className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Accueil
            </Link>
            <Link to="/beats" className="transition-colors hover:text-foreground">
              Catalogue
            </Link>
            <Link to="/about" className="transition-colors hover:text-foreground">
              À propos
            </Link>
            <Link to="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
        <div>
          <p className="eyebrow">Parlons musique</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            {settings?.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="transition-colors hover:text-primary"
              >
                {settings.contact_email}
              </a>
            ) : (
              <span>hello@danybeats.com</span>
            )}
            <a
              href={
                settings?.whatsapp_number ? `tel:${settings.whatsapp_number}` : "tel:+212600000000"
              }
              className="transition-colors hover:text-primary"
            >
              {settings?.whatsapp_number || "+212 6 00 00 00 00"}
            </a>
            <div className="flex flex-wrap gap-4 pt-2">
              {socials.length ? (
                socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url!}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-primary"
                  >
                    {s.label}
                  </a>
                ))
              ) : (
                <>
                  <a href="#" className="hover:text-primary">
                    YouTube
                  </a>
                  <a href="#" className="hover:text-primary">
                    TikTok
                  </a>
                  <a href="#" className="hover:text-primary">
                    Facebook
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-sm tracking-tighter uppercase">
            {settings?.producer_name ?? "Dany Beats"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            © {new Date().getFullYear()} — Instrumentales originales, sous licence pour les
            artistes.
          </p>
        </div>
        <span>© {new Date().getFullYear()} Dany Beats. Tous droits réservés.</span>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { current } = usePlayer();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={current ? "flex-1 pb-40" : "flex-1 pb-10"}>{children}</main>
      <Footer />
      <PlayerBar />
    </div>
  );
}
