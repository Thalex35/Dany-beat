const CACHE_NAME = "dany-beats-v1";
const APP_SHELL = [
  "/manifest.json",
  "/dany-beats.svg",
  "/icons/app-icon-192.png",
  "/icons/app-icon-512.png",
];

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
