// Basic WebSocket server for Next.js (Node runtime)
// Run: ensure experimental websocket support in Next config if needed
import { NextRequest } from 'next/server';

const clients = new Set<WebSocket>();

function broadcast(payload: any) {
  const msg = JSON.stringify(payload);
  for (const ws of clients) {
    try {
      ws.send(msg);
    } catch {
      // ignore broken connection
    }
  }
}

// Expose a (very) naive broadcaster for other modules (Optional hack)
// You could move this to a singleton or use globalThis
export function sendRealtimeEvent(type: string, data: any) {
  broadcast({ type, data, ts: Date.now() });
}

export const config = {
  runtime: 'nodejs',
};

export async function GET(req: NextRequest) {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket
    ? // If running in a Deno-compatible env (unlikely here)
      (Deno as any).upgradeWebSocket(req)
    : (globalThis as any).process
    ? (await (async () => {
        // Node 18+ style
        const { WebSocketServer } = await import('ws');
        // This path uses Next built-in upgrade—Below fallback for some hosting stacks
        // However Next route handlers do not natively expose upgrade in stable yet.
        // If unsupported, consider using a custom server (server.js) or external service.
      })())
    : null;

  // The above is complicated due to Next constraints. Simpler approach:

  const upgradeHeader = req.headers.get('upgrade') || '';
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Bad Request', { status: 400 });
  }

  // @ts-ignore - Next.js provides this symbol on request
  const { socket: ws, response: res } = (req as any).webSocket || {};
  if (!ws) {
    return new Response('WebSocket not supported in this environment', { status: 500 });
  }

  ws.accept();

  clients.add(ws);

  ws.addEventListener('message', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', ts: Date.now() }));
      }
      // Add channel / subscription logic if needed
    } catch {
      // ignore parse errors
    }
  });

  ws.addEventListener('close', () => {
    clients.delete(ws);
  });

  // Send initial hello
  ws.send(JSON.stringify({ type: 'WELCOME', ts: Date.now() }));

  return res;
}