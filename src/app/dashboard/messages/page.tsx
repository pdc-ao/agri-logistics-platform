'use client';

import { useEffect, useState } from 'react';

interface Conversation {
  id: string;
  participants: { id: string; username: string; fullName?: string }[];
  lastMessage?: { content: string; createdAt: string };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages/conversations');
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) return <p className="p-6">Carregando conversas...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mensagens</h1>
      {conversations.length === 0 ? (
        <p>Nenhuma conversa encontrada.</p>
      ) : (
        <ul className="space-y-3">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => (window.location.href = `/dashboard/messages/${conv.id}`)}
            >
              <p className="font-semibold">
                {conv.participants.map((p) => p.fullName || p.username).join(', ')}
              </p>
              {conv.lastMessage && (
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage.content}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
