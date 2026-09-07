import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Globe2, ImagePlus, Link2, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { fileExtension } from "@/lib/media";
import { settingsQuery, type SiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

const empty: SiteSettings = {
  producer_name: "",
  producer_bio: "",
  hero_eyebrow: "Catalogue indépendant",
  hero_title: "Des instrumentales pour les artistes qui prennent leur disque au sérieux.",
  hero_description: "",
  producer_photo_path: null,
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setForm({
        ...settings.data,
        hero_eyebrow: settings.data.hero_eyebrow ?? empty.hero_eyebrow,
        hero_title: settings.data.hero_title ?? empty.hero_title,
        hero_description: settings.data.hero_description ?? "",
        producer_photo_path: settings.data.producer_photo_path ?? null,
        instagram_url: settings.data.instagram_url ?? "",
        youtube_url: settings.data.youtube_url ?? "",
        tiktok_url: settings.data.tiktok_url ?? "",
      });
    }
  }, [settings.data]);

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const extension = fileExtension(file.name) || "jpg";
      const path = `producer/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file);
      if (error) throw error;
      setForm((prev) => ({ ...prev, producer_photo_path: path }));
      toast.success("Photo importée");
    } catch {
      toast.error("La photo n'a pas pu être importée.");
    } finally {
      setUploading(false);
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          producer_name: form.producer_name.trim(),
          producer_bio: form.producer_bio,
          hero_eyebrow: form.hero_eyebrow.trim(),
          hero_title: form.hero_title.trim(),
          hero_description: form.hero_description.trim(),
          producer_photo_path: form.producer_photo_path,
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
      className="admin-settings space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow text-primary">Identité du site</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">Paramètres</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Façonnez la présence de Dany Beats. Chaque modification est visible sur le site public.
          </p>
        </div>
        <div className="admin-settings-status">
          <span className="size-2 rounded-full bg-success" /> Site connecté
        </div>
      </header>

      <section className="admin-settings-panel">
        <div className="admin-section-label">
          <Sparkles />
          <span>Identité du producteur</span>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_0.8fr]">
          <div className="space-y-5">
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
              hint="Affichée sur l'accueil et la page À propos."
            >
              <Textarea
                id="producer_bio"
                rows={5}
                value={form.producer_bio}
                onChange={(e) => set("producer_bio")(e.target.value)}
              />
            </Field>
          </div>
          <div className="admin-photo-drop">
            <ImagePlus className="size-7 text-primary" />
            <p className="mt-4 text-sm font-medium">Portrait du producteur</p>
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WebP</p>
            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Importer une photo
              <Input
                id="producer_photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadPhoto(file);
                }}
              />
            </label>
            <p className="mt-3 truncate text-xs text-muted-foreground">
              {form.producer_photo_path
                ? "Photo prête à être enregistrée"
                : "Aucune photo personnalisée"}
            </p>
          </div>
        </div>
      </section>

      <section className="admin-settings-panel">
        <div className="admin-section-label">
          <Globe2 />
          <span>Accueil public</span>
        </div>
        <div className="mt-4 space-y-5">
          <Field label="Petit titre" htmlFor="hero_eyebrow">
            <Input
              id="hero_eyebrow"
              value={form.hero_eyebrow}
              onChange={(e) => set("hero_eyebrow")(e.target.value)}
            />
          </Field>
          <Field label="Titre principal" htmlFor="hero_title">
            <Textarea
              id="hero_title"
              rows={3}
              value={form.hero_title}
              onChange={(e) => set("hero_title")(e.target.value)}
              required
            />
          </Field>
          <Field label="Description d'accueil" htmlFor="hero_description">
            <Textarea
              id="hero_description"
              rows={3}
              value={form.hero_description}
              onChange={(e) => set("hero_description")(e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="admin-settings-panel">
        <div className="admin-section-label">
          <Link2 />
          <span>Contact et réseaux</span>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Numéro WhatsApp" htmlFor="whatsapp_number">
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
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
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
      </section>
      <Button className="admin-save-button" type="submit" disabled={save.isPending}>
        <Save />
        {save.isPending ? "Enregistrement…" : "Enregistrer les paramètres"}
      </Button>
    </form>
  );
}
