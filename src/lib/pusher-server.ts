// Option 1: Using Pusher (Recommended for production)
// src/lib/pusher-server.ts
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Trigger events
export async function triggerRealtimeEvent(
  channel: string,
  event: string,
  data: any
) {
  await pusherServer.trigger(channel, event, data);
}

/*
// src/lib/pusher-client.ts
import PusherClient from "pusher-js";

export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authEndpoint: "/api/pusher/auth",
});

// Subscribe to channels
export function subscribeToChannel(channelName: string, callbacks: {
  onMessage?: (data: any) => void;
  onOrderUpdate?: (data: any) => void;
  onNotification?: (data: any) => void;
}) {
  const channel = pusherClient.subscribe(channelName);

  if (callbacks.onMessage) {
    channel.bind("message", callbacks.onMessage);
  }

  if (callbacks.onOrderUpdate) {
    channel.bind("order-update", callbacks.onOrderUpdate);
  }

  if (callbacks.onNotification) {
    channel.bind("notification", callbacks.onNotification);
  }

  return channel;
}

// src/app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const socketId = formData.get("socket_id") as string;
  const channelName = formData.get("channel_name") as string;

  // Validate user has access to this channel
  const userId = (session.user as any).id;
  
  // Private channels start with "private-"
  if (channelName.startsWith("private-")) {
    const channelUserId = channelName.split("-")[1];
    
    if (channelUserId !== userId && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Presence channels start with "presence-"
  if (channelName.startsWith("presence-")) {
    const presenceData = {
      user_id: userId,
      user_info: {
        email: session.user.email,
        role: (session.user as any).role,
      },
    };

    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channelName,
      presenceData
    );

    return NextResponse.json(authResponse);
  }

  // Standard private channel
  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}

// ============================================
// Option 2: Standalone WebSocket Server (ws library)
// server.js (Create this in root directory)
// ============================================

/*
const { WebSocketServer } = require('ws');
const { createServer } = require('http');
const { parse } = require('url');

const server = createServer();
const wss = new WebSocketServer({ server });

// Store connections by user ID
const connections = new Map();

wss.on('connection', (ws, req) => {
  const { query } = parse(req.url, true);
  const userId = query.userId;

  if (!userId) {
    ws.close(4000, 'User ID required');
    return;
  }

  // Store connection
  connections.set(userId, ws);

  console.log(`User ${userId} connected`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(userId, data);
    } catch (error) {
      console.error('Invalid message:', error);
    }
  });

  ws.on('close', () => {
    connections.delete(userId);
    console.log(`User ${userId} disconnected`);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    userId,
    timestamp: Date.now(),
  }));
});

function handleMessage(userId, data) {
  const { type, payload } = data;

  switch (type) {
    case 'message':
      broadcastToUser(payload.recipientId, {
        type: 'new_message',
        data: payload,
      });
      break;

    case 'order_update':
      broadcastToUsers(payload.userIds, {
        type: 'order_update',
        data: payload,
      });
      break;

    case 'ping':
      const ws = connections.get(userId);
      if (ws) {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
      break;

    default:
      console.warn('Unknown message type:', type);
  }
}

function broadcastToUser(userId, message) {
  const ws = connections.get(userId);
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcastToUsers(userIds, message) {
  userIds.forEach(userId => broadcastToUser(userId, message));
}

// Broadcast function for API routes to call
function broadcastEvent(event, userIds, data) {
  broadcastToUsers(userIds, {
    type: event,
    data,
    timestamp: Date.now(),
  });
}

// Export for use in API routes
module.exports = { broadcastEvent };

const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
*/

/*
// ============================================
// Client-side WebSocket hook
// src/lib/useWebSocket.ts (Updated)
// ============================================

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

// For Pusher
import { pusherClient, subscribeToChannel } from "./pusher-client";

export function useRealtimeUpdates(userId: string) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to user's private channel
    const channel = subscribeToChannel(`private-user-${userId}`, {
      onMessage: (data) => {
        // Handle incoming message
        console.log("New message:", data);
        // Trigger your message handler
      },
      onOrderUpdate: (data) => {
        console.log("Order update:", data);
        // Trigger your order update handler
      },
      onNotification: (data) => {
        console.log("New notification:", data);
        // Trigger your notification handler
      },
    });

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
      console.log("Connected to realtime updates");
    });

    channel.bind("pusher:subscription_error", (error: any) => {
      console.error("Subscription error:", error);
      setIsConnected(false);
    });

    return () => {
      pusherClient.unsubscribe(`private-user-${userId}`);
      setIsConnected(false);
    };
  }, [userId]);

  return { isConnected };
}

// Usage in your API routes
// src/app/api/messages/route.ts
import { triggerRealtimeEvent } from "@/lib/pusher-server";

export async function POST(request: NextRequest) {
  // ... create message logic ...
  
  // Trigger realtime event
  await triggerRealtimeEvent(
    `private-user-${recipientId}`,
    "message",
    {
      messageId: message.id,
      senderId,
      content: message.content,
      timestamp: message.createdAt,
    }
  );

  return NextResponse.json({ success: true, message });
} 
*/