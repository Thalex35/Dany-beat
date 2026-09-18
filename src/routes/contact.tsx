import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MessageCircle, Music2, Phone, Youtube } from "lucide-react";

import { ContactForm } from "@/components/site/ContactForm";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Dany Beats" },
      {
        name: "description",
        content: "Contactez le producteur par e-mail ou WhatsApp pour toute question.",
      },
      { property: "og:title", content: "Contact | Dany Beats" },
      { property: "og:description", content: "Écrivez-nous par e-mail ou WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useSettings();
  const phone = settings?.whatsapp_number || "+212 6 00 00 00 00";
  const email = settings?.contact_email || "hello@danybeats.com";
  const socials = [
    { label: "YouTube", value: settings?.youtube_url || "youtube.com/@danybeats", icon: Youtube },
    {
      label: "Instagram",
      value: settings?.instagram_url || "instagram.com/danybeats",
      icon: Instagram,
    },
    { label: "TikTok", value: settings?.tiktok_url || "tiktok.com/@danybeats", icon: Music2 },
    { label: "Facebook", value: "facebook.com/danybeats", icon: Facebook },
  ];
  return (
    <SiteLayout>
      <div className="contact-page mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <header className="contact-intro max-w-3xl">
          <p className="eyebrow text-primary">Parlons de votre prochain morceau</p>
          <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] tracking-tighter sm:text-7xl">
            Une idée, un besoin, un son à construire.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Écrivez directement au producteur. Que vous cherchiez une licence, un beat sur mesure ou
            simplement une réponse, chaque message arrive au bon endroit.
          </p>
        </header>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="contact-panel contact-panel-main">
            <div className="flex items-center gap-3 text-primary">
              <Mail className="size-5" />
              <span className="eyebrow text-primary">Contact</span>
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Contactez-nous
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Votre nom, votre e-mail, votre message. On s'occupe du reste.
            </p>
            <ContactForm bare />
          </div>

          <aside className="contact-panel contact-panel-info">
            <p className="eyebrow text-primary">Les coordonnées</p>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight">
              Restons en contact.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Besoin d'une réponse rapide ? Retrouvez toutes les portes d'entrée vers le studio.
            </p>
            <div className="mt-10 grid gap-5">
              <a href={`mailto:${email}`} className="contact-detail">
                <Mail />
                <span>
                  <small>E-mail</small>
                  <strong>{email}</strong>
                </span>
              </a>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="contact-detail">
                <Phone />
                <span>
                  <small>Téléphone / WhatsApp</small>
                  <strong>{phone}</strong>
                </span>
              </a>
            </div>
            <div className="mt-10 border-t border-border pt-6">
              <p className="eyebrow">Réseaux</p>
              <div className="mt-5 grid gap-3">
                {socials.map(({ label, value, icon: Icon }) => (
                  <a
                    key={label}
                    href={value.startsWith("http") ? value : `https://${value}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="social-link"
                  >
                    <Icon />
                    <span>{label}</span>
                    <span className="ml-auto text-muted-foreground">↗</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="mt-10 rounded-2xl bg-primary p-5 text-primary-foreground">
              <MessageCircle className="size-5" />
              <p className="mt-4 font-display text-xl font-semibold">
                Un beat vous attend peut-être déjà.
              </p>
              <a
                href="/beats"
                className="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
              >
                Explorer le catalogue
              </a>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
