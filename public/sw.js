// Define a cache name
const CACHE_NAME = 'playgate-v1';
const OFFLINE_URL = 'offline.html';

// List of files to cache
const urlsToCache = [
  '/',
  '/offline.html',
  '/logo.jpg',
  '/logo-192.png',
  '/logo-512.png',
  '/logo-maskable-512.png',
  '/manifest.json'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add offline.html to the cache
        const offlineRequest = new Request(OFFLINE_URL, { cache: 'reload' });
        return cache.add(offlineRequest).then(() => {
          // You can cache other assets here if needed
          // For now, just caching the offline page is enough for PWA installability
        });
      })
  );
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  // We only want to handle navigation requests
  if (event.request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // First, try to use the navigation preload response if it's supported
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        // Always try the network first
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        // Catch is only triggered if the network fails
        console.log('Fetch failed; returning offline page instead.', error);

        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })()
  );
});
