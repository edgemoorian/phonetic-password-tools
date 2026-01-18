// service-worker.js - Updated for all PWABuilder icons (Edgemoorian Tools)

// Bump this version to v2 (or higher if you already used v2) to force browsers to update and use the new cache with all icons!
const CACHE_NAME = 'edgemoorian-tools-v2';

const ASSETS_TO_CACHE = [
  '/',                              // Root page
  '/index.html',                    // Main HTML
  '/manifest.json',                 // Manifest (critical for PWA)
  // All your exact icons from the repo (standard + maskable from PWABuilder)
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
  // That's all – your app has no other files!
];

// Install: precache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .catch(err => console.error('Precaching failed:', err))
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

// Fetch: cache-first with network fallback + offline message
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
      .catch(() => new Response('Offline – your app works fully once installed!', { headers: { 'Content-Type': 'text/plain' } }))
  );
});