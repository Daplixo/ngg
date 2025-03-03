const CACHE_NAME = "guessingGame-v1";
const ASSETS = [
  "./", // index.html is at root
  "./index.html",
  // Add all your asset files here
  "./clockticking.wav",
  "./notification.wav",
  "./gameover.wav",
  "./manifest.json"
];

// Install event: cache all needed files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch event: serve from cache if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
