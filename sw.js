// Service worker mínimo: hace la app instalable. No guarda nada en caché a propósito,
// para que siempre se cargue la versión más reciente y los datos vengan siempre de Supabase.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
