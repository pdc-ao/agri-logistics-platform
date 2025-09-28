'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageContent: string;
  sentAt: string;
  sender: { username: string; fullName?: string };
  receiver: { username: string; fullName?: string };
}

interface ConversationPreview {
  conversationId: string;
  lastMessage: Message;
  otherPartyName: string;
  unreadCount: number;
}

export default function MessagesInboxPage() {
  const userId = 'replace-with-session-id';
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages?senderId=${userId}`);
        const data = await res.json();
        const msgs: Message[] = data.messages || [];
        setMessages(msgs);
        const convMap: Record<string, ConversationPreview> = {};
        msgs.forEach(m => {
          const other = m.senderId === userId ? (m.receiver.fullName || m.receiver.username) : (m.sender.fullName || m.sender.username);
          if (!convMap[m.conversationId]) {
            convMap[m.conversationId] = {
              conversationId: m.conversationId,
              lastMessage: m,
              otherPartyName: other,
              unreadCount: 0,
            };
          }
          // simplistic: last message override if newer
          if (new Date(m.sentAt) > new Date(convMap[m.conversationId].lastMessage.sentAt)) {
            convMap[m.conversationId].lastMessage = m;
          }
        });
        setConversations(Object.values(convMap));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mensagens</h1>
      {loading ? (
        <div className="py-10 text-center text-gray-500">Carregando...</div>
      ) : conversations.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Nenhuma conversa</div>
      ) : (
        <ul className="divide-y border rounded bg-white">
          {conversations.map(c => (
            <li key={c.conversationId} className="p-4 hover:bg-gray-50 flex justify-between">
              <div>
                <div className="font-medium text-gray-800">{c.otherPartyName}</div>
                <div className="text-sm text-gray-600 line-clamp-1">
                  {c.lastMessage.messageContent}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(c.lastMessage.sentAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href={`/messages/${encodeURIComponent(c.conversationId)}`}
                  className="text-green-600 text-sm underline"
                >
                  Abrir
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-400">
        (Real-time não implementado; considere WebSocket / Pusher.)
      </p>
    </div>
  );
}