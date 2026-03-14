const BASE_URL = import.meta.env.VITE_API_URL || "";

export function connectRealtime(
  handlers: Record<string, (data: any) => void>
) {
  const es = new EventSource(`${BASE_URL}/api/sync/stream`);

  for (const [table, handler] of Object.entries(handlers)) {
    es.addEventListener(table, (e: MessageEvent) => {
      try {
        handler(JSON.parse(e.data));
      } catch {}
    });
  }

  es.onerror = () => {
    es.close();
    setTimeout(() => connectRealtime(handlers), 3000);
  };

  return es;
}
