import { MOCKING } from "@/lib/api/client";

export const WS_URL = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000").replace(/\/$/, "");

/**
 * Opens a Django Channels socket (or its mock) and returns a close function.
 * Reconnects with backoff on unexpected close; JSON messages only.
 */
export function openSocket<T>(path: string, onMessage: (data: T) => void, mock: (cb: (data: T) => void) => () => void) {
  if (MOCKING) return mock(onMessage);

  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let retry: ReturnType<typeof setTimeout> | undefined;

  const connect = () => {
    socket = new WebSocket(`${WS_URL}/${path}`);
    socket.onopen = () => {
      attempt = 0;
    };
    socket.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data as string) as T);
      } catch {
        /* ignore malformed frames */
      }
    };
    socket.onclose = (e) => {
      if (closed || e.code === 1000) return;
      retry = setTimeout(connect, Math.min(10_000, 500 * 2 ** attempt++));
    };
  };
  connect();

  return () => {
    closed = true;
    clearTimeout(retry);
    socket?.close(1000);
  };
}
