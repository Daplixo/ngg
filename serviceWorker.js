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
  
  console.log('Installing service worker...');
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  // Claim clients immediately
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
        console.log('Fetch failed, falling back to cache for:', event.request.url);
        return caches.match(event.request);
      })
  );
});
