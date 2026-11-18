const CACHE_NAME = "dany-beats-v2";
const APP_SHELL = [
  "/manifest.json",
  "/dany-beats.svg",
  "/icons/app-icon-192.png",
  "/icons/app-icon-512.png",
];
const NOTIFICATION_DB = "dany-beats-notifications";
const NOTIFICATION_STORE = "notifications";

function openNotificationDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NOTIFICATION_DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(NOTIFICATION_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getNotifications() {
  const db = await openNotificationDb();
  const items = await new Promise((resolve, reject) => {
    const request = db.transaction(NOTIFICATION_STORE).objectStore(NOTIFICATION_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function saveNotification(notification) {
  const db = await openNotificationDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(NOTIFICATION_STORE, "readwrite");
    transaction.objectStore(NOTIFICATION_STORE).put(notification);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function markNotificationRead(id) {
  const db = await openNotificationDb();
  await new Promise((resolve, reject) => {
    const store = db.transaction(NOTIFICATION_STORE, "readwrite").objectStore(NOTIFICATION_STORE);
    const request = store.get(id);
    request.onsuccess = () => {
      if (request.result) store.put({ ...request.result, read: true });
    };
    request.onerror = () => reject(request.error);
    request.transaction.oncomplete = resolve;
    request.transaction.onerror = () => reject(request.transaction.error);
  });
  db.close();
}

async function markAllNotificationsRead() {
  const db = await openNotificationDb();
  await new Promise((resolve, reject) => {
    const store = db.transaction(NOTIFICATION_STORE, "readwrite").objectStore(NOTIFICATION_STORE);
    const request = store.openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      cursor.update({ ...cursor.value, read: true });
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
    request.transaction.oncomplete = resolve;
    request.transaction.onerror = () => reject(request.transaction.error);
  });
  db.close();
}

async function updateAppBadge() {
  const unreadCount = (await getNotifications()).filter((item) => !item.read).length;
  try {
    if (unreadCount > 0 && self.navigator.setAppBadge) {
      await self.navigator.setAppBadge(unreadCount);
    } else if (unreadCount === 0 && self.navigator.clearAppBadge) {
      await self.navigator.clearAppBadge();
    }
  } catch (error) {
    console.error("Impossible de mettre à jour le badge de l'application.", error);
  }
  return unreadCount;
}

async function notifyClients() {
  await updateAppBadge();
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type: "NOTIFICATIONS_UPDATED" }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("dany-beats-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message.type !== "string") return;

  const respond = async (result, broadcast = false) => {
    if (event.ports[0]) event.ports[0].postMessage(result);
    if (broadcast) await notifyClients();
    else await updateAppBadge();
  };
  if (message.type === "GET_NOTIFICATIONS") {
    event.waitUntil(getNotifications().then(respond));
  } else if (message.type === "MARK_NOTIFICATION_READ" && typeof message.value === "string") {
    event.waitUntil(markNotificationRead(message.value).then((result) => respond(result, true)));
  } else if (message.type === "MARK_ALL_NOTIFICATIONS_READ") {
    event.waitUntil(markAllNotificationsRead().then((result) => respond(result, true)));
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let data = {};
      try {
        data = event.data ? event.data.json() : {};
      } catch (error) {
        console.error("Le contenu de la notification Push est invalide.", error);
      }

      const id = typeof data.id === "string" ? data.id : crypto.randomUUID();
      const title = typeof data.title === "string" ? data.title : "Nouveau beat";
      const body = typeof data.body === "string" ? data.body : "Un nouveau beat est disponible.";
      const requestedUrl = typeof data.url === "string" ? data.url : "/";
      const url = new URL(requestedUrl, self.location.origin);
      if (url.origin !== self.location.origin) url.href = self.location.origin + "/";

      await saveNotification({
        id,
        title,
        body,
        url: url.pathname + url.search + url.hash,
        createdAt: new Date().toISOString(),
        read: false,
      });
      await self.registration.showNotification(title, {
        body,
        icon: "/icons/app-icon-192.png",
        badge: "/icons/app-icon-192.png",
        tag: `dany-beats-${id}`,
        data: { id, url: url.pathname + url.search + url.hash },
      });
      await notifyClients();
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const data = event.notification.data || {};
      if (typeof data.id === "string") await markNotificationRead(data.id);
      await notifyClients();
      const target = new URL(typeof data.url === "string" ? data.url : "/", self.location.origin);
      if (target.origin !== self.location.origin) target.href = self.location.origin + "/";
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin) && "navigate" in client) {
          await client.navigate(target.href);
          return client.focus();
        }
      }
      return self.clients.openWindow(target.href);
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.search ||
    request.headers.has("range") ||
    url.pathname.startsWith("/storage/v1/") ||
    url.pathname.startsWith("/rest/v1/") ||
    url.pathname.startsWith("/functions/v1/")
  ) {
    return;
  }

  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(async (cached) => {
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, response.clone()))
              .catch((error) =>
                console.error("Impossible de mettre la ressource en cache.", error),
              ),
          );
        }
        return response;
      }),
    );
  }
});
