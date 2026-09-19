// Minimal service worker. Its only job is to make the app eligible for "Add
// to Home Screen" + PWA share-target. No offline caching by design — the
// experience relies on live Supabase + Anthropic calls.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// No-op fetch handler so the service worker registers as "controlling".
self.addEventListener('fetch', () => {
  // intentional: defer to network in all cases
});
