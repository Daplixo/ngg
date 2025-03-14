const CACHE_NAME = 'number-game-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/gameLogic.js',
  './js/gameState.js',
  './js/uiManager.js',
  './js/audioManager.js',
  './assets/notification.wav',
  './assets/gameover.wav',
  './manifest.json'
];

// Install service worker and cache all assets
self.addEventListener('install', (event) => {
  // Skip the wait so the service worker activates immediately
  self.skipWaiting();
  
  // Cache critical assets
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and non-HTTP/HTTPS URLs
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith('http')) {
    return;
  }
  
  // Simple network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
