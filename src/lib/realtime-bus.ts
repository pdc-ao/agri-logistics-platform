// Simple event bus placeholder. Replace with Redis or external service in production.
type Listener = (evt: { type: string; data: any; ts: number }) => void;

const listeners = new Set<Listener>();

export function onRealtimeEvent(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitRealtime(type: string, data: any) {
  const evt = { type, data, ts: Date.now() };
  for (const l of listeners) {
    try { l(evt); } catch {}
  }
}