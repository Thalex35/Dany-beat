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

export function openGmail(params: { to: string; subject: string; body: string }) {
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    params.to,
  )}&su=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(params.body)}`;
  void track("contact_email_click");
  window.open(url, "_blank", "noopener,noreferrer");
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

export function startPurchase(params: { beatId: string; beatTitle: string; licenseName?: string | null; price?: number | null; producerName: string; buyerName?: string | null; whatsappNumber: string }) {
  openWhatsapp({
    phone: params.whatsappNumber,
    text: [`Bonjour ${params.producerName}, je suis intéressé(e) par le beat « ${params.beatTitle} ».`, params.licenseName ? `Licence : ${params.licenseName}` : null, params.price != null ? `Prix affiché : ${params.price} $` : null, params.buyerName ? `Mon nom : ${params.buyerName}` : null, `Référence du beat : ${params.beatId}`, "J'aimerais connaître les licences disponibles et les tarifs."].filter(Boolean).join("\n"),
  });
}
