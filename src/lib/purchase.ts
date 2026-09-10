import { track } from "@/lib/analytics";

export type PurchaseIntent = {
  beatId: string;
  beatTitle: string;
  licenseName?: string | null;
  price?: number | null;
  producerName: string;
  buyerName?: string | null;
  whatsappNumber: string;
};

export type PurchaseProvider = {
  id: string;
  label: string;
  /** Returns true when the provider can handle the intent. */
  isConfigured: (intent: PurchaseIntent) => boolean;
  start: (intent: PurchaseIntent) => Promise<void> | void;
};

function buildWhatsappMessage(intent: PurchaseIntent) {
  const lines = [
    `Bonjour ${intent.producerName}, je suis intéressé(e) par le beat "${intent.beatTitle}".`,
    intent.licenseName ? `Licence : ${intent.licenseName}` : null,
    typeof intent.price === "number" && intent.price > 0
      ? `Prix affiché : ${intent.price} $`
      : null,
    intent.buyerName ? `Mon nom : ${intent.buyerName}` : null,
    `Référence du beat : ${intent.beatId}`,
    "Je l'ai trouvé sur votre site et j'aimerais connaître les licences disponibles et les tarifs.",
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * MVP checkout provider. Swapping in Stripe/Paddle later means adding another
 * provider here — callers only ever use `startPurchase`.
 */
export const whatsappProvider: PurchaseProvider = {
  id: "whatsapp",
  label: "Demander via WhatsApp",
  isConfigured: (intent) => !!intent.whatsappNumber?.replace(/\D/g, ""),
  start: async (intent) => {
    const phone = intent.whatsappNumber.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsappMessage(intent))}`;
    await track("whatsapp_click", { beatId: intent.beatId });
    window.open(url, "_blank", "noopener,noreferrer");
  },
};

export const activeProvider: PurchaseProvider = whatsappProvider;

export function startPurchase(intent: PurchaseIntent) {
  return activeProvider.start(intent);
}
