import { supabase } from "@/integrations/supabase/client";

export type BeatNotification = {
  id: string;
  title: string;
  body: string;
  url: string;
  createdAt: string;
  read: boolean;
};

type NotificationWorker = ServiceWorker & {
  postMessage(message: unknown, transfer?: Transferable[]): void;
};

type NotificationNavigator = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

const vapidPublicKey = import.meta.env["VITE_VAPID_PUBLIC_KEY"];

function getWorker(): Promise<NotificationWorker> {
  if (!("serviceWorker" in navigator)) {
    return Promise.reject(new Error("Ce navigateur ne prend pas en charge les notifications."));
  }

  return navigator.serviceWorker.ready.then((registration) => {
    const worker = registration.active ?? navigator.serviceWorker.controller;
    if (!worker) throw new Error("Le service worker de Dany Beats n'est pas actif.");
    return worker as NotificationWorker;
  });
}

function requestFromWorker<T>(type: string, value?: string): Promise<T> {
  return getWorker().then(
    (worker) =>
      new Promise<T>((resolve, reject) => {
        const channel = new MessageChannel();
        const timeout = window.setTimeout(() => {
          channel.port1.close();
          reject(new Error("Le service worker n'a pas répondu."));
        }, 5000);
        channel.port1.onmessage = (event: MessageEvent<T>) => {
          window.clearTimeout(timeout);
          channel.port1.close();
          resolve(event.data);
        };
        worker.postMessage({ type, value }, [channel.port2]);
      }),
  );
}

export async function getBeatNotifications(): Promise<BeatNotification[]> {
  return requestFromWorker<BeatNotification[]>("GET_NOTIFICATIONS");
}

export async function markBeatNotificationRead(id: string): Promise<void> {
  await requestFromWorker<void>("MARK_NOTIFICATION_READ", id);
}

export async function markAllBeatNotificationsRead(): Promise<void> {
  await requestFromWorker<void>("MARK_ALL_NOTIFICATIONS_READ");
}

export async function updateInstalledAppBadge(count: number): Promise<void> {
  const badgeNavigator = navigator as NotificationNavigator;
  try {
    if (count > 0 && badgeNavigator.setAppBadge) {
      await badgeNavigator.setAppBadge(count);
    } else if (count === 0 && badgeNavigator.clearAppBadge) {
      await badgeNavigator.clearAppBadge();
    }
  } catch (error) {
    console.error("Impossible de mettre à jour le badge de l'application.", error);
  }
}

function decodeBase64Url(value: string): Uint8Array {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export async function subscribeToBeatNotifications(): Promise<void> {
  if (!window.isSecureContext || !("Notification" in window) || !("PushManager" in window)) {
    throw new Error("Les notifications Push ne sont pas disponibles dans ce navigateur.");
  }
  if (!vapidPublicKey) {
    throw new Error("Les notifications Push ne sont pas configurées sur ce site.");
  }

  let permission = Notification.permission;
  if (permission === "default") permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Autorisez les notifications dans les réglages de votre navigateur.");
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeBase64Url(vapidPublicKey),
    }));
  const keys = subscription.toJSON().keys;
  if (!keys?.p256dh || !keys.auth) {
    throw new Error("Le navigateur n'a pas fourni les clés nécessaires à l'abonnement.");
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    { onConflict: "endpoint" },
  );
  if (error) throw error;
}

export async function unsubscribeFromBeatNotifications(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", subscription.endpoint);
  if (error) throw error;

  const unsubscribed = await subscription.unsubscribe();
  if (!unsubscribed) throw new Error("L'abonnement Push n'a pas pu être désactivé.");
}
