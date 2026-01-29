const CACHE_NAME = 'dontendero-web-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through for now, can be enhanced for offline support later
    event.respondWith(fetch(event.request));
});
