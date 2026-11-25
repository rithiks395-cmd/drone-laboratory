// UAV Virtual Lab Service Worker for 100% Offline Laboratory Operation
const CACHE_NAME = 'uav-virtuallab-offline-v2';

const OFFLINE_CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[UAV-SW] Pre-caching offline laboratory shell assets...');
      return cache.addAll(OFFLINE_CORE_ASSETS).catch((err) => {
        console.warn('[UAV-SW] Some assets could not be pre-cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[UAV-SW] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback & Cache Population
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Ignore peerjs signaling / websocket connections
  if (event.request.url.includes('peerjs') || event.request.url.startsWith('ws:') || event.request.url.startsWith('wss:')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Fetch from network to update cache in background
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and no network, cachedResponse is returned
          if (cachedResponse) {
            return cachedResponse;
          }
          // For HTML navigation requests, return the cached index.html
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html') || caches.match('/');
          }
        });

      // Return cached version immediately if available (Cache First for offline speed), or network
      return cachedResponse || fetchPromise;
    })
  );
});
