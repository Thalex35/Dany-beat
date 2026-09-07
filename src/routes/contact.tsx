import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <ContactForm />
        {settings?.contact_email || settings?.whatsapp_number ? (
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Vous pouvez aussi nous écrire directement
            {settings?.contact_email ? ` à ${settings.contact_email}` : ""}
            {settings?.whatsapp_number ? " ou sur WhatsApp." : "."}
          </p>
        ) : null}
      </div>
    </SiteLayout>
  );
}
