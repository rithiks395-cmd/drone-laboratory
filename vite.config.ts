import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), droneRelayPlugin()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0) so phone can connect
    port: 5173,
  },
});
