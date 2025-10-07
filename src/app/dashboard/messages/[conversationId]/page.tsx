'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function ConversationPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?conversationId=${conversationId}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  if (loading) return <p className="p-6">Carregando mensagens...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Conversa #{conversationId}</h1>
      <div className="space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="border rounded p-2">
            <p className="text-sm text-gray-500">
              {new Date(msg.createdAt).toLocaleString()}
            </p>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
