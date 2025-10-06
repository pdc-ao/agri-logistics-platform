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
