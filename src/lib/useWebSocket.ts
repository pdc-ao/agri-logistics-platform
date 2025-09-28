'use client';
import { useEffect, useRef, useState } from 'react';

interface RealtimeEvent<T=any> {
  type: string;
  data?: T;
  ts: number;
}

export function useWebSocketChannel(onEvent?: (evt: RealtimeEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}/api/ws`);
    wsRef.current = ws;

    ws.addEventListener('open', () => setConnected(true));
    ws.addEventListener('close', () => setConnected(false));
    ws.addEventListener('message', (message) => {
      try {
        const parsed = JSON.parse(message.data);
        onEvent?.(parsed);
      } catch {
        // ignore
      }
    });

    return () => {
      ws.close();
    };
  }, [onEvent]);

  function send(type: string, data?: any) {
    wsRef.current?.send(JSON.stringify({ type, data }));
  }

  return { connected, send };
}