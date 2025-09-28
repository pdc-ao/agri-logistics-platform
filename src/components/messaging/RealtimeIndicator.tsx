'use client';
import { useWebSocketChannel } from '@/lib/useWebSocket';
import { useEffect, useState } from 'react';

export default function RealtimeIndicator() {
  const [lastEvent, setLastEvent] = useState<string>('');
  const { connected } = useWebSocketChannel((evt) => {
    if (evt.type === 'MESSAGE_CREATED') {
      setLastEvent(`Nova mensagem às ${new Date(evt.ts).toLocaleTimeString()}`);
    }
  });

  return (
    <div className="text-xs text-gray-500">
      WS: {connected ? 'Conectado' : 'Desconectado'} {lastEvent && `| ${lastEvent}`}
    </div>
  );
}