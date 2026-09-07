import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, type SiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

const empty: SiteSettings = {
  producer_name: "",
  producer_bio: "",
  whatsapp_number: "",
  contact_email: "",
  instagram_url: "",
  youtube_url: "",
  tiktok_url: "",
};

function AdminSettings() {
  const queryClient = useQueryClient();
  const settings = useQuery(settingsQuery);
  const [form, setForm] = useState<SiteSettings>(empty);

  useEffect(() => {
    if (settings.data) {
      setForm({
        ...settings.data,
        instagram_url: settings.data.instagram_url ?? "",
        youtube_url: settings.data.youtube_url ?? "",
        tiktok_url: settings.data.tiktok_url ?? "",
      });
    }
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          producer_name: form.producer_name.trim(),
          producer_bio: form.producer_bio,
          whatsapp_number: form.whatsapp_number.trim(),
          contact_email: form.contact_email.trim(),
          instagram_url: form.instagram_url?.trim() || null,
          youtube_url: form.youtube_url?.trim() || null,
          tiktok_url: form.tiktok_url?.trim() || null,
        })
        .eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Paramètres enregistrés");
    },
    onError: () => toast.error("Les paramètres n'ont pas pu être enregistrés."),
  });

  if (settings.isPending) return <Skeleton className="h-72 w-full max-w-xl" />;
  if (settings.isError)
    return (
      <ErrorState
        title="Une erreur est survenue"
        description="Les paramètres n'ont pas pu être chargés."
        onRetry={() => void settings.refetch()}
      />
    );

  const set = (key: keyof SiteSettings) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className="max-w-xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <Field label="Nom du producteur" htmlFor="producer_name">
        <Input
          id="producer_name"
          value={form.producer_name}
          onChange={(e) => set("producer_name")(e.target.value)}
          required
        />
      </Field>
      <Field
        label="Biographie"
        htmlFor="producer_bio"
        hint="Affichée sur l'accueil et la page À propos. Les retours à la ligne créent des paragraphes."
      >
        <Textarea
          id="producer_bio"
          rows={5}
          value={form.producer_bio}
          onChange={(e) => set("producer_bio")(e.target.value)}
        />
      </Field>
      <Field
        label="Numéro WhatsApp"
        htmlFor="whatsapp_number"
        hint="Format international, ex. +212600000000. Utilisé pour toutes les demandes d'achat."
      >
        <Input
          id="whatsapp_number"
          value={form.whatsapp_number}
          onChange={(e) => set("whatsapp_number")(e.target.value)}
          placeholder="+212600000000"
        />
      </Field>
      <Field label="E-mail de contact" htmlFor="contact_email">
        <Input
          id="contact_email"
          type="email"
          value={form.contact_email}
          onChange={(e) => set("contact_email")(e.target.value)}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Instagram" htmlFor="instagram_url">
          <Input
            id="instagram_url"
            value={form.instagram_url ?? ""}
            onChange={(e) => set("instagram_url")(e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="YouTube" htmlFor="youtube_url">
          <Input
            id="youtube_url"
            value={form.youtube_url ?? ""}
            onChange={(e) => set("youtube_url")(e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="TikTok" htmlFor="tiktok_url">
          <Input
            id="tiktok_url"
            value={form.tiktok_url ?? ""}
            onChange={(e) => set("tiktok_url")(e.target.value)}
            placeholder="https://"
          />
        </Field>
      </div>
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? "Enregistrement…" : "Enregistrer les paramètres"}
      </Button>
    </form>
  );
}
