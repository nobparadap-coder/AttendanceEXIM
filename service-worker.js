const CACHE_NAME = "attendance-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/report.html",
  "/admin.html",
  "/manifest.json"
];

// ติดตั้ง service worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ดึงข้อมูลจาก cache ก่อน
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
