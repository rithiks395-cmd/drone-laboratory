import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

// High-speed, local Wi-Fi relay plugin for mobile phone drone remote control
// Enables zero-internet, sub-5ms low latency control between smartphone and laptop
function droneRelayPlugin(): Plugin {
  let latestControlPacket: any = null;
  let latestTelemetryPacket: any = null;
  const sseClients = new Set<any>();

  return {
    name: 'drone-relay-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          res.end();
          return;
        }

        // Endpoint: /api/drone/control (Mobile Phone -> Laptop)
        if (req.url?.startsWith('/api/drone/control')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
              try {
                latestControlPacket = JSON.parse(body);
                // Broadcast to laptop via SSE immediately
                const msg = `data: ${JSON.stringify({ type: 'control', packet: latestControlPacket })}\n\n`;
                for (const client of sseClients) {
                  try {
                    client.write(msg);
                  } catch (e) {
                    sseClients.delete(client);
                  }
                }
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                res.end(JSON.stringify({ status: 'ok', received: true }));
              } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'invalid json' }));
              }
            });
            return;
          } else if (req.method === 'GET') {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify(latestControlPacket || {}));
            return;
          }
        }

        // Endpoint: /api/drone/telemetry (Laptop -> Mobile Phone)
        if (req.url?.startsWith('/api/drone/telemetry')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
              try {
                latestTelemetryPacket = JSON.parse(body);
                const msg = `data: ${JSON.stringify({ type: 'telemetry', telemetry: latestTelemetryPacket })}\n\n`;
                for (const client of sseClients) {
                  try {
                    client.write(msg);
                  } catch (e) {
                    sseClients.delete(client);
                  }
                }
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                res.end(JSON.stringify({ status: 'ok' }));
              } catch (e) {
                res.writeHead(400);
                res.end();
              }
            });
            return;
          } else if (req.method === 'GET') {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify(latestTelemetryPacket || {}));
            return;
          }
        }

        // Endpoint: /api/drone/events (Server-Sent Events stream for instant updates)
        if (req.url?.startsWith('/api/drone/events')) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          });
          res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`);
          sseClients.add(res);

          req.on('close', () => {
            sseClients.delete(res);
          });
          return;
        }

        next();
      });
    },
  };
}

// Automatic Offline PWA Generator: Pre-caches every single JS and CSS file built
function offlinePwaPlugin(): Plugin {
  return {
    name: 'offline-pwa-plugin',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const assetsDir = path.resolve(distDir, 'assets');
      if (!fs.existsSync(assetsDir)) return;

      const assetFiles = fs.readdirSync(assetsDir);
      const assetUrls = assetFiles.map((file) => `/assets/${file}`);

      const allAssetsToCache = [
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.svg',
        '/icons.svg',
        ...assetUrls,
      ];

      const swContent = `// UAV Virtual Lab 100% Offline Service Worker
const CACHE_NAME = 'uav-lab-offline-v4';
const OFFLINE_CORE_ASSETS = ${JSON.stringify(allAssetsToCache, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA-SW] Pre-caching all ${allAssetsToCache.length} offline assets...');
      return cache.addAll(OFFLINE_CORE_ASSETS).catch((err) => {
        console.warn('[PWA-SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA-SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (url.includes('peerjs') || url.startsWith('ws:') || url.startsWith('wss:')) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately! (Cache First)
        // Background refresh if online
        fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // If offline and request is an HTML navigation, return cached /index.html
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html') || caches.match('/');
          }
        });
    })
  );
});
`;

      fs.writeFileSync(path.resolve(distDir, 'sw.js'), swContent);
      console.log(`[PWA] Generated offline service worker caching ${allAssetsToCache.length} assets.`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), droneRelayPlugin(), offlinePwaPlugin()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0) so phone can connect
    port: 5173,
  },
});
