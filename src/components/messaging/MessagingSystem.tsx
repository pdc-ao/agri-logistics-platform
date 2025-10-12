// src/components/messaging/MessagingSystem.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Message } from '@prisma/client';

export default function MessagingSystem({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(`/api/messages?userId=${currentUserId}`);
      if (res.ok) setMessages(await res.json());
    }
    fetchMessages();
  }, [currentUserId]);

  return (
    <div className="p-4 space-y-2">
      <h2 className="font-semibold">Messages</h2>
      {messages.map((m) => (
        <div key={m.id} className="border p-2 rounded">
          <p className="text-sm">{m.messageContent}</p>
          <span className="text-xs text-neutral-500">
            Sent at {new Date(m.sentAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
