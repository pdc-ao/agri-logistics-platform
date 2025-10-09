import { z } from "zod";
import { db } from "@/lib/prisma";
import { someHelper } from "@/lib/utils";

const clients = new Set<WebSocket>();

export function broadcast(payload: any) {
  const msg = JSON.stringify(payload);
  for (const ws of clients) {
    try {
      ws.send(msg);
    } catch {
      // ignore broken connection
    }
  }
}

export function sendRealtimeEvent(type: string, data: any) {
  broadcast({ type, data, ts: Date.now() });
}

export function registerClient(ws: WebSocket) {
  clients.add(ws);
  ws.addEventListener("close", () => clients.delete(ws));
}
