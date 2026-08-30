import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { updateSiteSettings } from "@/lib/admin";
import { settingsQuery } from "@/lib/settings";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const settings = useQuery(settingsQuery);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    producer_name: "",
    producer_bio: "",
    whatsapp_number: "",
    contact_email: "",
    instagram_url: "",
    youtube_url: "",
    tiktok_url: "",
  });

  useEffect(() => {
    if (settings.data) {
      setForm({
        producer_name: settings.data.producer_name,
        producer_bio: settings.data.producer_bio,
        whatsapp_number: settings.data.whatsapp_number,
        contact_email: settings.data.contact_email,
        instagram_url: settings.data.instagram_url ?? "",
        youtube_url: settings.data.youtube_url ?? "",
        tiktok_url: settings.data.tiktok_url ?? "",
      });
    }
  }, [settings.data]);

  const mutation = useMutation({
    mutationFn: () =>
      updateSiteSettings({
        producer_name: form.producer_name.trim(),
        producer_bio: form.producer_bio.trim(),
        whatsapp_number: form.whatsapp_number.trim(),
        contact_email: form.contact_email.trim(),
        instagram_url: form.instagram_url.trim() || null,
        youtube_url: form.youtube_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Settings saved");
      void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: () => toast.error("Could not save settings."),
  });

  if (settings.isPending) {
    return (
      <div className="max-w-xl space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (settings.isError) {
    return (
      <ErrorState
        description="Settings could not be loaded."
        onRetry={() => void settings.refetch()}
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tighter">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Producer branding and contact details shown across the site.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="mt-8 max-w-xl space-y-4"
      >
        <Field label="Producer name" htmlFor="producer_name">
          <Input
            id="producer_name"
            required
            value={form.producer_name}
            onChange={(e) => setForm({ ...form, producer_name: e.target.value })}
          />
        </Field>
        <Field label="Bio" htmlFor="producer_bio">
          <Textarea
            id="producer_bio"
            rows={4}
            value={form.producer_bio}
            onChange={(e) => setForm({ ...form, producer_bio: e.target.value })}
          />
        </Field>
        <Field
          label="WhatsApp number"
          htmlFor="whatsapp_number"
          hint="Include country code, digits only, e.g. 15551234567"
        >
          <Input
            id="whatsapp_number"
            required
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
          />
        </Field>
        <Field label="Contact email" htmlFor="contact_email">
          <Input
            id="contact_email"
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          />
        </Field>
        <Field label="Instagram URL" htmlFor="instagram_url">
          <Input
            id="instagram_url"
            value={form.instagram_url}
            onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
          />
        </Field>
        <Field label="YouTube URL" htmlFor="youtube_url">
          <Input
            id="youtube_url"
            value={form.youtube_url}
            onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
          />
        </Field>
        <Field label="TikTok URL" htmlFor="tiktok_url">
          <Input
            id="tiktok_url"
            value={form.tiktok_url}
            onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
          />
        </Field>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
