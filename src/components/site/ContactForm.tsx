import { Mail, MessageCircle, Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { openEmail, openWhatsapp } from "@/lib/contact";
import { useSettings } from "@/lib/settings";

type FormState = { name: string; email: string; message: string };

const initialState: FormState = { name: "", email: "", message: "" };

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const { data: settings } = useSettings();
  const [form, setForm] = useState<FormState>(initialState);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappReady = !!settings?.whatsapp_number?.replace(/\D/g, "");
  const emailReady = !!settings?.contact_email;
  const producerName = settings?.producer_name ?? "le producteur";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setError("Écrivez votre nom et votre message avant de continuer.");
      return;
    }
    setError(null);
    setReady(true);
  }

  function buildMessage() {
    const lines = [
      `Bonjour ${producerName},`,
      "",
      form.message.trim(),
      "",
      `— ${form.name.trim()}`,
      form.email.trim() ? `(${form.email.trim()})` : null,
    ].filter(Boolean);
    return lines.join("\n");
  }

  function handleEmail() {
    if (!settings?.contact_email) return;
    openEmail({
      to: settings.contact_email,
      subject: `Message de ${form.name.trim()} — via le site`,
      body: buildMessage(),
    });
  }

  function handleWhatsapp() {
    if (!settings?.whatsapp_number) return;
    openWhatsapp({ phone: settings.whatsapp_number, text: buildMessage() });
  }

  return (
    <div className={compact ? "" : "panel p-6 sm:p-10"}>
      {!compact ? (
        <>
          <p className="eyebrow">Contact</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Contactez-nous
          </h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Remplissez le formulaire ci-dessous, puis choisissez comment envoyer votre message : par
            e-mail ou par WhatsApp. Votre texte reste conservé, il ne vous restera qu'à appuyer sur
            envoyer.
          </p>
        </>
      ) : (
        <>
          <p className="eyebrow">Contact</p>
          <h3 className="font-display mt-2 text-xl font-semibold tracking-tight">Une question ?</h3>
        </>
      )}

      {!ready ? (
        <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
          <Field label="Votre nom" htmlFor="contact-name">
            <Input
              id="contact-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              maxLength={80}
              required
              placeholder="Votre nom"
            />
          </Field>
          <Field label="Votre e-mail (optionnel)" htmlFor="contact-email">
            <Input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              maxLength={120}
              placeholder="vous@exemple.com"
            />
          </Field>
          <Field label="Votre message" htmlFor="contact-message" error={error}>
            <Textarea
              id="contact-message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              maxLength={1000}
              required
              placeholder="Écrivez votre message ici…"
            />
          </Field>
          <Button type="submit" size="lg">
            Continuer
          </Button>
        </form>
      ) : (
        <div className="mt-6 max-w-md space-y-4">
          <div className="rounded-2xl bg-surface p-4 text-sm ring-1 ring-border">
            <p className="whitespace-pre-line text-muted-foreground">{buildMessage()}</p>
          </div>
          <p className="text-sm text-muted-foreground">Choisissez comment envoyer ce message :</p>
          <div className="flex flex-wrap items-center gap-3">
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
          <button
            type="button"
            onClick={() => setReady(false)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            <Pencil className="size-3" aria-hidden="true" />
            Modifier le message
          </button>
        </div>
      )}
    </div>
  );
}
