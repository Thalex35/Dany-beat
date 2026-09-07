import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";

import producerPhoto from "@/assets/producer-dany.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useSignedUrl } from "@/lib/media";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos du producteur | Dany Beats" },
      {
        name: "description",
        content:
          "Découvrez Dany, producteur et beatmaker : son parcours, son style de production et comment le contacter pour obtenir la licence d'une instrumentale.",
      },
      { property: "og:title", content: "À propos du producteur | Dany Beats" },
      {
        property: "og:description",
        content: "Parcours, style de production et contact direct pour vos licences de beats.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const DEFAULT_BIO = `Dany est producteur, beatmaker et ingénieur du son. Depuis dix ans, il façonne des instrumentales rap, trap, drill et afro pour des artistes indépendants.
Tout est écrit, arrangé et mixé dans son studio : choix des sons, design des drums, basse, mix final. Chaque beat est livré prêt pour l'enregistrement.`;

const highlights = [
  { label: "Années de production", value: "10+" },
  { label: "Projets accompagnés", value: "120+" },
  { label: "Styles", value: "Rap · Trap · Drill · Afro · R&B" },
];

function AboutPage() {
  const { data: settings } = useSettings();
  const whatsapp = settings?.whatsapp_number?.replace(/\D/g, "");
  const bio = settings?.producer_bio?.trim() ? settings.producer_bio : DEFAULT_BIO;
  const photo = useSignedUrl("site-assets", settings?.producer_photo_path);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <div>
            <img
              src={photo.data ?? producerPhoto}
              alt={`Portrait de ${settings?.producer_name ?? "Dany"} en studio`}
              width={1024}
              height={1280}
              className="w-full rounded-3xl object-cover ring-1 ring-border"
            />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.3em] text-primary uppercase">Le producteur</p>
            <h1 className="font-display mt-5 text-4xl font-semibold tracking-tighter sm:text-6xl">
              {settings?.producer_name ?? "Dany Beats"}
            </h1>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
              {bio
                .split("\n")
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>

            <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-3">
              {highlights.map((h) => (
                <div key={h.label} className="bg-background px-4 py-4">
                  <dt className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    {h.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium">{h.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/beats">Écouter le catalogue</Link>
              </Button>
              {whatsapp ? (
                <Button asChild variant="whatsapp" size="lg">
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer noopener">
                    <MessageCircle />
                    Écrire sur WhatsApp
                  </a>
                </Button>
              ) : null}
              {settings?.contact_email ? (
                <Button asChild variant="outline" size="lg">
                  <a href={`mailto:${settings.contact_email}`}>
                    <Mail />
                    Envoyer un e-mail
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
