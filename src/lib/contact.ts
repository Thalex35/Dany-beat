import { track } from "@/lib/analytics";

/**
 * Ouvre le client mail par défaut avec un message pré-rempli.
 * Le texte tapé par la personne reste intact : on ne fait qu'ouvrir
 * l'application mail, c'est elle qui clique sur « Envoyer ».
 */
export function openEmail(params: { to: string; subject: string; body: string }) {
  const url = `mailto:${encodeURIComponent(params.to)}?subject=${encodeURIComponent(
    params.subject,
  )}&body=${encodeURIComponent(params.body)}`;
  void track("contact_email_click");
  window.location.href = url;
}

/**
 * Ouvre WhatsApp (app ou web) avec un message pré-rempli dans le champ de saisie.
 */
export function openWhatsapp(params: { phone: string; text: string }) {
  const phone = params.phone.replace(/\D/g, "");
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(params.text)}`;
  void track("contact_whatsapp_click");
  window.open(url, "_blank", "noopener,noreferrer");
}
