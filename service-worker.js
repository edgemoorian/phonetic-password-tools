// service-worker.js - Robust version for Edgemoorian Tools (ignores precache failures)

// Bump to v3 to force fresh update/cache
const CACHE_NAME = 'edgemoorian-tools-v3';

const ASSETS_TO_CACHE = [
  '/', 
  '/index.html', 
  '/manifest.json',
  '/icon-16.png',
  '/icon-32.png',
  '/icon-48.png',
  '/icon-64.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-384.png',
  '/icon-512.png',
  '/maskable-icon-192.png',
  '/maskable-icon-512.png'
];

// Install: cache one by one (ignore failures – no crash)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return fetch(url).then(response => {
            if (response.ok) return cache.put(url, response);
          }).catch(() => console.log(`Failed to cache ${url} – skipping`));
        })
      );
    }).catch(err => console.error('Cache open failed:', err))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Fetch: cache-first + offline fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
      .catch(() => new Response('Offline – app works fully!', { headers: { 'Content-Type': 'text/plain' } }))
  );
});
