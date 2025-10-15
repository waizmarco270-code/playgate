
// A basic service worker for PWA installation capabilities.
// This file can be extended to add offline caching strategies.

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // No caching logic here yet, just ensuring it installs.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // We are not intercepting fetch requests yet.
  // The service worker is primarily for enabling PWA installation and file handling.
  event.respondWith(fetch(event.request));
});
