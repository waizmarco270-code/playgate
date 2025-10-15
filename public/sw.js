// A basic service worker to make the app installable.
// Caching strategies can be added later.

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
