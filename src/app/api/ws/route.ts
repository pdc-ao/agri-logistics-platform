import { NextRequest } from "next/server";
import { registerClient, broadcast } from "@/lib/ws-broadcast";

export const config = {
  runtime: "nodejs",
};

export async function GET(req: NextRequest) {
  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Bad Request", { status: 400 });
  }

  // @ts-ignore - Next.js provides this symbol on request
  const { socket: ws, response: res } = (req as any).webSocket || {};
  if (!ws) {
    return new Response("WebSocket not supported in this environment", { status: 500 });
  }

  ws.accept();
  registerClient(ws);

  ws.addEventListener("message", (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "PING") {
        ws.send(JSON.stringify({ type: "PONG", ts: Date.now() }));
      }
    } catch {
      // ignore parse errors
    }
  });

  ws.send(JSON.stringify({ type: "WELCOME", ts: Date.now() }));
  return res;
}
