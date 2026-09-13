/**
 * Minimal safe service worker — caches only static public assets.
 * Never caches conversations, auth cookies, or API responses.
 */
const CACHE = "manoyug-static-v1";
const PRECACHE = ["/", "/manifest.webmanifest", "/help", "/safety"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/student/chat")) return;
  if (url.pathname.includes("auth")) return;

  // Only same-origin static navigations / assets
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const type = res.headers.get("content-type") || "";
        if (
          res.ok &&
          (type.includes("text/css") ||
            type.includes("javascript") ||
            type.includes("image") ||
            type.includes("font") ||
            url.pathname === "/manifest.webmanifest")
        ) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    }),
  );
});
