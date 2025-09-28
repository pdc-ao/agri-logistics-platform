'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageContent: string;
  sentAt: string;
  sender: { fullName?: string; username: string };
  receiver: { fullName?: string; username: string };
}

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const userId = 'replace-with-session-id';
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      // Without an endpoint to directly fetch by conversationId only, we reuse GET with conversationId
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [conversationId]);

  async function sendMessage() {
    if (!draft.trim()) return;
    try {
      // Determine receiver: naive approach
      const first = messages[0];
      let receiverId: string | null = null;
      if (first) {
        receiverId = first.senderId === userId ? first.receiverId : first.senderId;
      } else {
        // Fallback: cannot send without a known peer
        alert('Não foi possível determinar destinatário nesta conversa vazia.');
        return;
      }
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          senderId: userId,
            receiverId,
          messageContent: draft,
          conversationId,
        }),
      });
      if (res.ok) {
        setDraft('');
        load();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)] space-y-4">
      <h1 className="text-xl font-bold text-gray-800">
        Conversa {conversationId}
      </h1>
      <div className="flex-1 border rounded p-4 overflow-y-auto bg-white">
        {loading ? (
          <div className="text-gray-500 text-sm">Carregando...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-sm">Sem mensagens</div>
        ) : (
          <ul className="space-y-3">
            {messages.map(m => {
              const mine = m.senderId === userId;
              return (
                <li
                  key={m.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded text-sm ${
                      mine
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="font-semibold text-xs mb-1">
                      {mine
                        ? 'Você'
                        : m.sender.fullName || m.sender.username}
                    </div>
                    <div>{m.messageContent}</div>
                    <div className="text-[10px] opacity-70 mt-1">
                      {new Date(m.sentAt).toLocaleTimeString()}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Digite sua mensagem..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Enviar
        </button>
      </div>
      <p className="text-xs text-gray-400">
        (Real-time não implementado — recarregar envia/recebe mensagens.)
      </p>
    </div>
  );
}