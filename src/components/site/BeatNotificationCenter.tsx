import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";

import {
  getBeatNotifications,
  markAllBeatNotificationsRead,
  markBeatNotificationRead,
  subscribeToBeatNotifications,
  unsubscribeFromBeatNotifications,
  updateInstalledAppBadge,
  type BeatNotification,
} from "@/lib/push-notifications";

function formatNotificationDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("fr", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function BeatNotificationCenter() {
  const [notifications, setNotifications] = useState<BeatNotification[]>([]);
  const [visible, setVisible] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  async function refresh() {
    try {
      const current = await getBeatNotifications();
      setNotifications(current);
      await updateInstalledAppBadge(current.filter((notification) => !notification.read).length);
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        setSubscribed(
          "pushManager" in registration && !!(await registration.pushManager.getSubscription()),
        );
      }
    } catch (refreshError) {
      console.error("Impossible de synchroniser les notifications de Dany Beats.", refreshError);
    }
  }

  useEffect(() => {
    void refresh();
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === "NOTIFICATIONS_UPDATED") void refresh();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  async function toggleSubscription() {
    setBusy(true);
    setError("");
    try {
      if (subscribed) await unsubscribeFromBeatNotifications();
      else await subscribeToBeatNotifications();
      await refresh();
    } catch (subscriptionError) {
      console.error("Impossible de modifier l'abonnement Push.", subscriptionError);
      setError(
        subscriptionError instanceof Error
          ? subscriptionError.message
          : "Le réglage des notifications a échoué.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function markAllRead() {
    setBusy(true);
    setError("");
    try {
      await markAllBeatNotificationsRead();
      await refresh();
    } catch (readError) {
      console.error("Impossible de marquer les notifications comme lues.", readError);
      setError("Les notifications n'ont pas pu être mises à jour.");
    } finally {
      setBusy(false);
    }
  }

  async function openNotification(notification: BeatNotification) {
    if (notification.read) return;
    try {
      await markBeatNotificationRead(notification.id);
      await refresh();
    } catch (readError) {
      console.error("Impossible de marquer cette notification comme lue.", readError);
    }
  }

  return (
    <div className="fixed right-4 top-20 z-[70] sm:right-6">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? ` : ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : ""}`}
        aria-expanded={visible}
        onClick={() => setVisible((open) => !open)}
        className="relative grid size-11 place-items-center rounded-full border border-border bg-background/95 text-foreground shadow-lg backdrop-blur transition-colors hover:bg-surface"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {visible ? (
        <section
          aria-label="Notifications des nouveaux beats"
          className="absolute right-0 mt-2 max-h-[min(70vh,32rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold">Nouveaux beats</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {unreadCount
                  ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Tout est à jour"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Fermer les notifications"
              className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-surface"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void toggleSubscription()}
            className="mt-4 w-full rounded-xl border border-border px-3 py-2 text-left text-xs font-medium hover:bg-surface disabled:opacity-60"
          >
            {busy ? "Mise à jour…" : subscribed ? "Désactiver les notifications Push" : "Activer les notifications Push"}
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Le badge sur l’icône installée dépend du navigateur et du système. Le compteur rouge
            dans Dany Beats reste visible si le badge natif n’est pas pris en charge.
          </p>

          {error ? (
            <p role="alert" className="mt-3 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          {unreadCount > 0 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void markAllRead()}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              <Check className="size-3.5" aria-hidden="true" />
              Tout marquer comme lu
            </button>
          ) : null}

          <ul className="mt-3 divide-y divide-border">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <a
                  href={notification.url}
                  onClick={() => void openNotification(notification)}
                  className={`block rounded-lg px-2 py-3 transition-colors hover:bg-surface ${
                    notification.read ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  <span className="flex items-start gap-2">
                    {!notification.read ? (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-600" />
                    ) : null}
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{notification.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed">{notification.body}</span>
                      <span className="mt-1 block text-[10px]">{formatNotificationDate(notification.createdAt)}</span>
                    </span>
                  </span>
                </a>
              </li>
            ))}
            {notifications.length === 0 ? (
              <li className="py-5 text-center text-xs text-muted-foreground">
                Les nouveaux beats publiés apparaîtront ici.
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
