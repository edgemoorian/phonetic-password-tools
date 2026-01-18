// sw.js - Tailored PWA Service Worker for Edgemoorian Phonetic & Password Tools

// Change this version number whenever you update assets, manifest, or add new files
// (e.g., to 'v2' when you make changes – this forces browsers to install the new version)
const CACHE_NAME = 'edgemoorian-tools-v1';

const ASSETS_TO_CACHE = [
  '/',                              // Root (often serves index.html)
  '/index.html',                    // Main entry point (from your start_url)
  '/manifest.json',                 // Critical – caches your updated manifest
  // All icons from your manifest.json
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon-192.png',
  '/maskable-icon-512.png',
  // Add your main CSS and JS files below (replace with actual paths if different)
  // Example placeholders – update these!
  '/css/styles.css',                // If you have a stylesheet
  '/js/main.js',                    // If you have a main script
  '/js/phonetic.js',                // Example for your phonetic converter logic
  '/js/password-generator.js',      // Example for password generator
  // Optional: add any other essential offline files (fonts, sounds, etc.)
  // '/offline.html'                // Uncomment and create if you want a custom offline page
];

// Install event – precache all essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Precaching essential assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => console.error('Precaching failed:', err))
  );
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Activate event – clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event – cache-first strategy with network fallback + runtime caching
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;  // Serve from cache if available
        }

        // Otherwise try network
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              // Clone and cache successful responses (runtime caching)
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Optional offline fallback
            // return caches.match('/offline.html') || new Response('You are offline', { status: 503 });
            return new Response('Offline – this app works fully offline once installed!', {
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});